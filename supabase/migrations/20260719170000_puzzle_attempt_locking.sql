-- Immutable, per-user daily puzzle submissions.

CREATE SCHEMA IF NOT EXISTS edubite_private;
REVOKE ALL ON SCHEMA edubite_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA edubite_private TO authenticated;

DROP FUNCTION IF EXISTS public.edubite_lock_puzzle_attempt(jsonb);
DROP FUNCTION IF EXISTS edubite_private.lock_puzzle_attempt(jsonb);

CREATE FUNCTION edubite_private.lock_puzzle_attempt(
  p_attempt jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid uuid := auth.uid();
  current_progress jsonb;
  existing_attempt jsonb;
  locked_attempt jsonb;
  puzzle_id text := coalesce(p_attempt->>'puzzleId', '');
  date_key text := coalesce(p_attempt->>'dateKey', '');
  response_type text := coalesce(p_attempt->>'responseType', '');
  note text := left(coalesce(p_attempt->>'note', ''), 8000);
  selected_option integer;
  current_streak integer;
  last_attempt_date text;
  yesterday_key text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF puzzle_id = '' OR date_key !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RAISE EXCEPTION 'invalid puzzle attempt';
  END IF;
  IF date_key <> to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') THEN
    RAISE EXCEPTION 'puzzle attempt date is not today';
  END IF;
  IF response_type NOT IN ('open-ended', 'mcq') THEN
    RAISE EXCEPTION 'invalid puzzle response type';
  END IF;

  IF response_type = 'mcq' THEN
    selected_option := (p_attempt->>'selectedOptionIndex')::integer;
    IF selected_option IS NULL OR selected_option < 0 OR selected_option > 3 THEN
      RAISE EXCEPTION 'invalid puzzle option';
    END IF;
  ELSIF btrim(note) = '' THEN
    RAISE EXCEPTION 'empty puzzle response';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text || ':puzzles', 0));

  SELECT payload
  INTO current_progress
  FROM public.edubite_puzzle_progress
  WHERE user_id = uid
  FOR UPDATE;

  current_progress := coalesce(
    current_progress,
    '{"version":2,"attempts":{},"streak":0,"lastAttemptDate":null}'::jsonb
  );
  current_progress := jsonb_set(
    current_progress,
    '{attempts}',
    CASE
      WHEN jsonb_typeof(current_progress->'attempts') = 'object'
        THEN current_progress->'attempts'
      ELSE '{}'::jsonb
    END,
    true
  );
  existing_attempt := current_progress#>ARRAY['attempts', date_key];
  IF existing_attempt IS NOT NULL THEN
    RETURN jsonb_build_object(
      'progress', current_progress,
      'inserted', false
    );
  END IF;

  locked_attempt := jsonb_build_object(
    'puzzleId', puzzle_id,
    'dateKey', date_key,
    'responseType', response_type,
    'note', CASE WHEN response_type = 'open-ended' THEN btrim(note) ELSE '' END,
    'selectedOptionIndex',
      CASE WHEN response_type = 'mcq' THEN to_jsonb(selected_option) ELSE 'null'::jsonb END,
    'submittedAt', to_jsonb(now())
  );

  current_streak := greatest(
    0,
    CASE
      WHEN coalesce(current_progress->>'streak', '') ~ '^\d+$'
        THEN (current_progress->>'streak')::integer
      ELSE 0
    END
  );
  last_attempt_date := current_progress->>'lastAttemptDate';
  yesterday_key := to_char(
    (now() AT TIME ZONE 'Asia/Kolkata')::date - 1,
    'YYYY-MM-DD'
  );

  current_progress := jsonb_set(current_progress, '{version}', '2'::jsonb, true);
  current_progress := jsonb_set(
    current_progress,
    ARRAY['attempts', date_key],
    locked_attempt,
    true
  );
  current_progress := jsonb_set(
    current_progress,
    '{streak}',
    to_jsonb(CASE WHEN last_attempt_date = yesterday_key THEN current_streak + 1 ELSE 1 END),
    true
  );
  current_progress := jsonb_set(
    current_progress,
    '{lastAttemptDate}',
    to_jsonb(date_key),
    true
  );

  INSERT INTO public.edubite_puzzle_progress (user_id, payload, updated_at)
  VALUES (uid, current_progress, now())
  ON CONFLICT (user_id) DO UPDATE SET
    payload = EXCLUDED.payload,
    updated_at = now();

  RETURN jsonb_build_object(
    'progress', current_progress,
    'inserted', true
  );
END;
$$;

REVOKE ALL ON FUNCTION edubite_private.lock_puzzle_attempt(jsonb)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION edubite_private.lock_puzzle_attempt(jsonb)
TO authenticated;

CREATE FUNCTION public.edubite_lock_puzzle_attempt(
  p_attempt jsonb
) RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT edubite_private.lock_puzzle_attempt(p_attempt);
$$;

REVOKE ALL ON FUNCTION public.edubite_lock_puzzle_attempt(jsonb)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.edubite_lock_puzzle_attempt(jsonb)
TO authenticated;
