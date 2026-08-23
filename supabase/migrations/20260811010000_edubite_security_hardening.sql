-- Make Edubite progress and Monthly Challenge server-authoritative.
-- All mutating public RPCs bind writes to auth.uid() and run atomically.

CREATE SCHEMA IF NOT EXISTS edubite_private;
REVOKE ALL ON SCHEMA edubite_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA edubite_private TO authenticated;

ALTER TABLE public.edubite_monthly_challenge_enrollments
  ADD COLUMN IF NOT EXISTS stake_deducted_at timestamptz;

-- Existing rows predate this marker and match persisted enrollment state.
UPDATE public.edubite_monthly_challenge_enrollments
SET stake_deducted_at = enrolled_at
WHERE stake_deducted_at IS NULL;

ALTER TABLE public.edubite_monthly_challenge_enrollments
  ALTER COLUMN stake_deducted_at SET NOT NULL;

DROP POLICY IF EXISTS edubite_game_state_insert
  ON public.edubite_game_state;
DROP POLICY IF EXISTS edubite_game_state_update
  ON public.edubite_game_state;
DROP POLICY IF EXISTS "Users insert own challenge enrollments"
  ON public.edubite_monthly_challenge_enrollments;
DROP POLICY IF EXISTS "Users insert own challenge entries"
  ON public.edubite_monthly_challenge_entries;
DROP POLICY IF EXISTS "Authenticated read challenge entries"
  ON public.edubite_monthly_challenge_entries;
DROP POLICY IF EXISTS "Users read own challenge entries"
  ON public.edubite_monthly_challenge_entries;
DROP POLICY IF EXISTS "Admins insert challenge enrollments"
  ON public.edubite_monthly_challenge_enrollments;

CREATE POLICY "Users read own challenge entries"
  ON public.edubite_monthly_challenge_entries
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.edubite_is_content_admin());

REVOKE INSERT, DELETE, TRUNCATE
  ON public.edubite_game_state
  FROM anon, authenticated;
REVOKE UPDATE
  ON public.edubite_game_state
  FROM anon, authenticated;
REVOKE INSERT, DELETE, TRUNCATE
  ON public.edubite_monthly_challenge_enrollments
  FROM anon, authenticated;
REVOKE INSERT, DELETE, TRUNCATE
  ON public.edubite_monthly_challenge_entries
  FROM anon, authenticated;

DROP FUNCTION IF EXISTS public.edubite_save_game_state(jsonb);
DROP FUNCTION IF EXISTS edubite_private.save_game_state(jsonb);

CREATE FUNCTION edubite_private.save_game_state(
  p_payload jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid uuid := auth.uid();
  current_payload jsonb;
  next_payload jsonb;
  today_key text := to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD');
  incoming_day text;
  current_day text;
  current_rdm integer := 0;
  dose_reward integer := 45;
  fun_base integer := 10;
  fun_combo_bonus integer := 5;
  max_dose_credit integer;
  max_fun_credit integer;
  previous_dose_credit integer := 0;
  previous_fun_credit integer := 0;
  incoming_dose_credit integer := 0;
  incoming_fun_credit integer := 0;
  previous_habit_credit integer := 0;
  incoming_habit_credit integer := 0;
  rdm_delta integer := 0;
  schedule_date date;
  dose_class text;
  dose_answers jsonb;
  dose_correct integer := 0;
  fun_answers jsonb;
  fun_score integer := 0;
  fun_combo integer := 0;
  answer_index integer := 0;
  answer_value text;
  question_row record;
  puzzle_done boolean := false;
  current_log jsonb;
  incoming_log jsonb;
  existing_today jsonb;
  today_criteria jsonb;
  all_done boolean;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION 'invalid game state';
  END IF;
  IF octet_length(p_payload::text) > 262144 THEN
    RAISE EXCEPTION 'game state too large';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text || ':game-state', 0));

  SELECT payload
  INTO current_payload
  FROM public.edubite_game_state
  WHERE user_id = uid
  FOR UPDATE;

  current_payload := coalesce(current_payload, '{}'::jsonb);
  current_rdm := CASE
    WHEN coalesce(current_payload->>'rdm', '') ~ '^\d+$'
      THEN (current_payload->>'rdm')::integer
    ELSE 0
  END;
  incoming_day := coalesce(p_payload->>'lastActiveDate', '');
  current_day := coalesce(current_payload->>'lastActiveDate', '');

  SELECT coalesce(max(amount) FILTER (WHERE reward_key = 'dose.per_correct'), 45),
         coalesce(max(amount) FILTER (WHERE reward_key = 'funbrain.base_points'), 10),
         coalesce(max(amount) FILTER (WHERE reward_key = 'funbrain.combo_bonus'), 5)
  INTO dose_reward, fun_base, fun_combo_bonus
  FROM public.edubite_rdm_rewards
  WHERE reward_key IN (
    'dose.per_correct',
    'funbrain.base_points',
    'funbrain.combo_bonus'
  );

  max_dose_credit := greatest(0, dose_reward) * 5;
  max_fun_credit := greatest(0, fun_base) * 6
    + greatest(0, fun_combo_bonus) * 15;

  IF current_day = today_key THEN
    previous_dose_credit := least(
      max_dose_credit,
      greatest(
        0,
        CASE
          WHEN coalesce(current_payload->>'doseRdmCredited', '') ~ '^\d+$'
            THEN (current_payload->>'doseRdmCredited')::integer
          ELSE 0
        END
      )
    );
    previous_fun_credit := least(
      max_fun_credit,
      greatest(
        0,
        CASE
          WHEN coalesce(current_payload->>'funbrainRdmCredited', '') ~ '^\d+$'
            THEN (current_payload->>'funbrainRdmCredited')::integer
          ELSE 0
        END
      )
    );
  END IF;

  IF incoming_day = today_key THEN
    schedule_date := date '2026-01-01'
      + (((today_key::date - date '2026-01-01') % 180 + 180) % 180);
    dose_class := p_payload#>>'{dose,currentClass}';
    dose_answers := CASE dose_class
      WHEN '11' THEN coalesce(p_payload#>'{dose,answers11}', '[]'::jsonb)
      WHEN '12' THEN coalesce(p_payload#>'{dose,answers12}', '[]'::jsonb)
      ELSE '[]'::jsonb
    END;
    IF jsonb_typeof(dose_answers) <> 'array' THEN
      dose_answers := '[]'::jsonb;
    END IF;

    SELECT count(*)::integer
    INTO dose_correct
    FROM (
      SELECT q.correct, row_number() OVER (ORDER BY q.sort_order, q.id) AS ordinal
      FROM public.edubite_content_questions q
      WHERE q.domain = 'dailydose'
        AND q.published = true
        AND q.class_level = dose_class
        AND q.active_date = schedule_date
      LIMIT 5
    ) verified_question
    JOIN LATERAL jsonb_array_elements_text(dose_answers)
      WITH ORDINALITY AS submitted(value, ordinal)
      ON submitted.ordinal = verified_question.ordinal
    WHERE submitted.value ~ '^\d+$'
      AND submitted.value::integer = verified_question.correct;

    incoming_dose_credit := least(
      max_dose_credit,
      greatest(0, dose_correct * dose_reward)
    );

    fun_answers := coalesce(p_payload#>'{funbrain,answers}', '[]'::jsonb);
    IF jsonb_typeof(fun_answers) <> 'array' THEN
      fun_answers := '[]'::jsonb;
    END IF;
    FOR question_row IN
      SELECT q.correct
      FROM public.edubite_content_questions q
      WHERE q.domain = 'funbrain'
        AND q.published = true
        AND q.active_date = schedule_date
      ORDER BY q.sort_order, q.id
      LIMIT 6
    LOOP
      answer_value := fun_answers->>answer_index;
      IF coalesce(answer_value, '') ~ '^\d+$'
        AND answer_value::integer = question_row.correct
      THEN
        fun_score := fun_score + fun_base + (fun_combo * fun_combo_bonus);
        fun_combo := fun_combo + 1;
      ELSE
        fun_combo := 0;
      END IF;
      answer_index := answer_index + 1;
    END LOOP;
    incoming_fun_credit := least(max_fun_credit, greatest(0, fun_score));
  END IF;

  IF current_day = today_key THEN
    SELECT coalesce(sum(
      CASE h->>'id'
        WHEN 'sleep' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.sleep'), 15)
        WHEN 'water' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.water'), 10)
        WHEN 'eyes' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.eyes'), 8)
        WHEN 'move' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.move'), 10)
        WHEN 'pomodoro' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.pomodoro'), 12)
        WHEN 'noscreen' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.noscreen'), 10)
        WHEN 'meals' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.meals'), 12)
        WHEN 'noai' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.noai'), 15)
        ELSE 0
      END
    ), 0)::integer
    INTO previous_habit_credit
    FROM jsonb_array_elements(
      CASE
        WHEN jsonb_typeof(current_payload->'habits') = 'array'
          THEN current_payload->'habits'
        ELSE '[]'::jsonb
      END
    ) h
    WHERE coalesce(h->>'done', 'false') = 'true';
  END IF;

  IF incoming_day = today_key THEN
    SELECT coalesce(sum(
      CASE h->>'id'
        WHEN 'sleep' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.sleep'), 15)
        WHEN 'water' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.water'), 10)
        WHEN 'eyes' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.eyes'), 8)
        WHEN 'move' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.move'), 10)
        WHEN 'pomodoro' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.pomodoro'), 12)
        WHEN 'noscreen' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.noscreen'), 10)
        WHEN 'meals' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.meals'), 12)
        WHEN 'noai' THEN coalesce((SELECT amount FROM public.edubite_rdm_rewards WHERE reward_key = 'habit.noai'), 15)
        ELSE 0
      END
    ), 0)::integer
    INTO incoming_habit_credit
    FROM jsonb_array_elements(
      CASE
        WHEN jsonb_typeof(p_payload->'habits') = 'array'
          THEN p_payload->'habits'
        ELSE '[]'::jsonb
      END
    ) h
    WHERE coalesce(h->>'done', 'false') = 'true';
  END IF;

  rdm_delta :=
    greatest(0, incoming_dose_credit - previous_dose_credit)
    + greatest(0, incoming_fun_credit - previous_fun_credit)
    + (incoming_habit_credit - previous_habit_credit);

  next_payload := p_payload;
  next_payload := jsonb_set(
    next_payload,
    '{rdm}',
    to_jsonb(greatest(0, current_rdm + rdm_delta)),
    true
  );
  next_payload := jsonb_set(
    next_payload,
    '{doseRdmCredited}',
    to_jsonb(greatest(previous_dose_credit, incoming_dose_credit)),
    true
  );
  next_payload := jsonb_set(
    next_payload,
    '{funbrainRdmCredited}',
    to_jsonb(greatest(previous_fun_credit, incoming_fun_credit)),
    true
  );

  -- Enrollment and submission flags are changed only by challenge RPCs.
  next_payload := jsonb_set(
    next_payload,
    '{challengeEnrolledMonthKey}',
    coalesce(current_payload->'challengeEnrolledMonthKey', 'null'::jsonb),
    true
  );
  next_payload := jsonb_set(
    next_payload,
    '{challengeEnrolledMonths}',
    coalesce(current_payload->'challengeEnrolledMonths', '[]'::jsonb),
    true
  );
  next_payload := jsonb_set(
    next_payload,
    '{challengePuzzleSubmittedMonthKey}',
    coalesce(current_payload->'challengePuzzleSubmittedMonthKey', 'null'::jsonb),
    true
  );

  -- Historical challenge evidence is immutable for learners. Admin App Clock
  -- keeps its existing behavior for QA accounts.
  IF NOT public.edubite_is_content_admin() THEN
    current_log := CASE
      WHEN jsonb_typeof(current_payload->'dayCriteriaLog') = 'object'
        THEN current_payload->'dayCriteriaLog'
      ELSE '{}'::jsonb
    END;
    incoming_log := CASE
      WHEN jsonb_typeof(p_payload->'dayCriteriaLog') = 'object'
        THEN p_payload->'dayCriteriaLog'
      ELSE '{}'::jsonb
    END;
    existing_today := coalesce(current_log->today_key, '{}'::jsonb);
    SELECT EXISTS (
      SELECT 1
      FROM public.edubite_puzzle_progress puzzle
      WHERE puzzle.user_id = uid
        AND puzzle.payload#>ARRAY['attempts', today_key] IS NOT NULL
    ) INTO puzzle_done;

    today_criteria := jsonb_build_object(
      'dose',
        coalesce(existing_today->>'dose', 'false') = 'true'
        OR coalesce(p_payload#>>'{dose,completed}', 'false') = 'true',
      'funbrain',
        coalesce(existing_today->>'funbrain', 'false') = 'true'
        OR coalesce(p_payload#>>'{funbrain,completed}', 'false') = 'true',
      'puzzles',
        coalesce(existing_today->>'puzzles', 'false') = 'true'
        OR puzzle_done,
      'habits',
        coalesce(existing_today->>'habits', 'false') = 'true'
        OR (
          jsonb_typeof(p_payload->'habits') = 'array'
          AND jsonb_array_length(p_payload->'habits') >= 8
          AND NOT EXISTS (
            SELECT 1
            FROM jsonb_array_elements(p_payload->'habits') habit
            WHERE coalesce(habit->>'done', 'false') <> 'true'
          )
        ),
      'pledges',
        coalesce(existing_today->>'pledges', 'false') = 'true'
        OR (
          coalesce(p_payload->>'pledgeAM', 'false') = 'true'
          AND coalesce(p_payload->>'pledgePM', 'false') = 'true'
        ),
      'pledgeAM',
        coalesce(existing_today->>'pledgeAM', 'false') = 'true'
        OR coalesce(p_payload->>'pledgeAM', 'false') = 'true',
      'pledgePM',
        coalesce(existing_today->>'pledgePM', 'false') = 'true'
        OR coalesce(p_payload->>'pledgePM', 'false') = 'true',
      'habitsDone',
        coalesce(existing_today->'habitsDone', '[]'::jsonb)
        || coalesce(incoming_log#>ARRAY[today_key, 'habitsDone'], '[]'::jsonb),
      'completedAt',
        coalesce(existing_today->'completedAt', 'null'::jsonb)
    );
    all_done :=
      today_criteria->>'dose' = 'true'
      AND today_criteria->>'funbrain' = 'true'
      AND today_criteria->>'puzzles' = 'true'
      AND today_criteria->>'habits' = 'true'
      AND today_criteria->>'pledges' = 'true';
    IF all_done AND coalesce(today_criteria->>'completedAt', '') = '' THEN
      today_criteria := jsonb_set(today_criteria, '{completedAt}', to_jsonb(now()), true);
    END IF;
    current_log := jsonb_set(current_log, ARRAY[today_key], today_criteria, true);
    next_payload := jsonb_set(next_payload, '{dayCriteriaLog}', current_log, true);
  END IF;

  INSERT INTO public.edubite_game_state (user_id, payload, updated_at)
  VALUES (uid, next_payload, now())
  ON CONFLICT (user_id) DO UPDATE SET
    payload = EXCLUDED.payload,
    updated_at = now();

  RETURN next_payload;
END;
$$;

CREATE FUNCTION public.edubite_save_game_state(
  p_payload jsonb
) RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT edubite_private.save_game_state(p_payload);
$$;

REVOKE ALL ON FUNCTION edubite_private.save_game_state(jsonb)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION edubite_private.save_game_state(jsonb)
  TO authenticated;
REVOKE ALL ON FUNCTION public.edubite_save_game_state(jsonb)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.edubite_save_game_state(jsonb)
  TO authenticated;

DROP FUNCTION IF EXISTS public.edubite_enroll_monthly_challenge(text, text, text);
DROP FUNCTION IF EXISTS edubite_private.enroll_monthly_challenge(text, text, text);

CREATE FUNCTION edubite_private.enroll_monthly_challenge(
  p_month_key text,
  p_display_name text,
  p_date_key text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid uuid := auth.uid();
  effective_date date;
  effective_month text;
  target_rdm integer;
  stake_rdm integer;
  current_payload jsonb;
  current_rdm integer;
  months jsonb;
  existing_enrollment public.edubite_monthly_challenge_enrollments%ROWTYPE;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  effective_date := CASE
    WHEN public.edubite_is_content_admin()
      AND coalesce(p_date_key, '') ~ '^\d{4}-\d{2}-\d{2}$'
      THEN p_date_key::date
    ELSE (now() AT TIME ZONE 'Asia/Kolkata')::date
  END;
  effective_month := to_char(effective_date, 'YYYY-MM');
  IF p_month_key !~ '^\d{4}-\d{2}$' OR p_month_key <> effective_month THEN
    RAISE EXCEPTION 'invalid challenge month';
  END IF;
  IF extract(day FROM effective_date)::integer NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'challenge entry window is closed';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text || ':challenge:' || p_month_key, 0));

  SELECT *
  INTO existing_enrollment
  FROM public.edubite_monthly_challenge_enrollments
  WHERE user_id = uid AND month_key = p_month_key
  FOR UPDATE;
  IF FOUND THEN
    IF existing_enrollment.stake_deducted_at IS NULL THEN
      RAISE EXCEPTION 'unverified challenge enrollment';
    END IF;
    SELECT payload INTO current_payload
    FROM public.edubite_game_state
    WHERE user_id = uid
    FOR UPDATE;
    RETURN jsonb_build_object(
      'alreadyEnrolled', true,
      'monthKey', p_month_key,
      'stakeRdm', existing_enrollment.stake_rdm,
      'state', current_payload
    );
  END IF;

  SELECT payload
  INTO current_payload
  FROM public.edubite_game_state
  WHERE user_id = uid
  FOR UPDATE;
  IF current_payload IS NULL THEN
    RAISE EXCEPTION 'no progress found';
  END IF;
  current_rdm := CASE
    WHEN coalesce(current_payload->>'rdm', '') ~ '^\d+$'
      THEN (current_payload->>'rdm')::integer
    ELSE 0
  END;
  SELECT coalesce(max(amount) FILTER (WHERE reward_key = 'challenge.target_rdm'), 5000),
         coalesce(max(amount) FILTER (WHERE reward_key = 'challenge.entry_stake'), 3000)
  INTO target_rdm, stake_rdm
  FROM public.edubite_rdm_rewards
  WHERE reward_key IN ('challenge.target_rdm', 'challenge.entry_stake');
  IF current_rdm < target_rdm THEN
    RAISE EXCEPTION 'insufficient RDM to unlock challenge';
  END IF;
  IF current_rdm < stake_rdm THEN
    RAISE EXCEPTION 'insufficient RDM for challenge stake';
  END IF;

  INSERT INTO public.edubite_monthly_challenge_enrollments (
    user_id,
    month_key,
    stake_rdm,
    display_name,
    enrolled_at,
    stake_deducted_at
  ) VALUES (
    uid,
    p_month_key,
    stake_rdm,
    left(coalesce(nullif(btrim(p_display_name), ''), 'Learner'), 80),
    now(),
    now()
  );

  months := CASE
    WHEN jsonb_typeof(current_payload->'challengeEnrolledMonths') = 'array'
      THEN current_payload->'challengeEnrolledMonths'
    ELSE '[]'::jsonb
  END;
  IF NOT months ? p_month_key THEN
    months := months || to_jsonb(p_month_key);
  END IF;
  current_payload := jsonb_set(current_payload, '{rdm}', to_jsonb(current_rdm - stake_rdm), true);
  current_payload := jsonb_set(current_payload, '{challengeEnrolledMonthKey}', to_jsonb(p_month_key), true);
  current_payload := jsonb_set(current_payload, '{challengeEnrolledMonths}', months, true);

  UPDATE public.edubite_game_state
  SET payload = current_payload, updated_at = now()
  WHERE user_id = uid;

  RETURN jsonb_build_object(
    'alreadyEnrolled', false,
    'monthKey', p_month_key,
    'stakeRdm', stake_rdm,
    'state', current_payload
  );
END;
$$;

CREATE FUNCTION public.edubite_enroll_monthly_challenge(
  p_month_key text,
  p_display_name text,
  p_date_key text DEFAULT NULL
) RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT edubite_private.enroll_monthly_challenge(
    p_month_key,
    p_display_name,
    p_date_key
  );
$$;

REVOKE ALL ON FUNCTION edubite_private.enroll_monthly_challenge(text, text, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION edubite_private.enroll_monthly_challenge(text, text, text)
  TO authenticated;
REVOKE ALL ON FUNCTION public.edubite_enroll_monthly_challenge(text, text, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.edubite_enroll_monthly_challenge(text, text, text)
  TO authenticated;

DROP FUNCTION IF EXISTS public.edubite_submit_monthly_challenge(text, text, text, text);
DROP FUNCTION IF EXISTS edubite_private.submit_monthly_challenge(text, text, text, text);

CREATE FUNCTION edubite_private.submit_monthly_challenge(
  p_month_key text,
  p_answer text,
  p_display_name text,
  p_date_key text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid uuid := auth.uid();
  effective_date date;
  effective_month text;
  last_day date;
  current_payload jsonb;
  criteria_log jsonb;
  history jsonb;
  join_date date;
  days_since_join integer;
  history_len integer;
  use_legacy_history boolean := false;
  cursor_day date;
  day_key text;
  criteria jsonb;
  days_before integer;
  history_index integer;
  run integer := 0;
  best_run integer := 0;
  inserted_at timestamptz;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF length(btrim(coalesce(p_answer, ''))) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION 'answer must be 1-2000 characters';
  END IF;
  effective_date := CASE
    WHEN public.edubite_is_content_admin()
      AND coalesce(p_date_key, '') ~ '^\d{4}-\d{2}-\d{2}$'
      THEN p_date_key::date
    ELSE (now() AT TIME ZONE 'Asia/Kolkata')::date
  END;
  effective_month := to_char(effective_date, 'YYYY-MM');
  last_day := (date_trunc('month', effective_date)::date + interval '1 month - 1 day')::date;
  IF p_month_key !~ '^\d{4}-\d{2}$' OR p_month_key <> effective_month THEN
    RAISE EXCEPTION 'invalid challenge month';
  END IF;
  IF effective_date <> last_day THEN
    RAISE EXCEPTION 'challenge puzzle is not open';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.edubite_monthly_challenge_enrollments
    WHERE user_id = uid
      AND month_key = p_month_key
      AND stake_deducted_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'verified enrollment required';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text || ':challenge-submit:' || p_month_key, 0));

  SELECT payload
  INTO current_payload
  FROM public.edubite_game_state
  WHERE user_id = uid
  FOR UPDATE;
  IF current_payload IS NULL THEN
    RAISE EXCEPTION 'no progress found';
  END IF;
  criteria_log := CASE
    WHEN jsonb_typeof(current_payload->'dayCriteriaLog') = 'object'
      THEN current_payload->'dayCriteriaLog'
    ELSE '{}'::jsonb
  END;
  -- Match client criteriaForDate: gap-free legacy history still counts when
  -- dayCriteriaLog is sparse (non-admin saves only persist today's log entry).
  history := CASE
    WHEN jsonb_typeof(current_payload->'history') = 'array'
      THEN current_payload->'history'
    ELSE '[]'::jsonb
  END;
  join_date := CASE
    WHEN coalesce(current_payload->>'joinedDate', '') ~ '^\d{4}-\d{2}-\d{2}$'
      THEN (current_payload->>'joinedDate')::date
    ELSE effective_date
  END;
  IF join_date > effective_date THEN
    join_date := effective_date;
  END IF;
  days_since_join := effective_date - join_date;
  history_len := jsonb_array_length(history);
  use_legacy_history := days_since_join > 0 AND history_len = days_since_join;

  cursor_day := date_trunc('month', effective_date)::date;
  WHILE cursor_day <= last_day LOOP
    day_key := to_char(cursor_day, 'YYYY-MM-DD');
    criteria := criteria_log->day_key;
    IF criteria IS NULL
      AND use_legacy_history
      AND cursor_day < effective_date
      AND cursor_day >= join_date
    THEN
      days_before := effective_date - cursor_day;
      history_index := history_len - days_before;
      IF history_index >= 0 AND history_index < history_len THEN
        criteria := history->history_index;
      END IF;
    END IF;
    criteria := coalesce(criteria, '{}'::jsonb);
    IF coalesce(criteria->>'dose', 'false') = 'true'
      AND coalesce(criteria->>'funbrain', 'false') = 'true'
      AND coalesce(criteria->>'puzzles', 'false') = 'true'
      AND coalesce(criteria->>'habits', 'false') = 'true'
      AND coalesce(criteria->>'pledges', 'false') = 'true'
    THEN
      run := run + 1;
      best_run := greatest(best_run, run);
    ELSE
      run := 0;
    END IF;
    cursor_day := cursor_day + 1;
  END LOOP;
  IF best_run < 15 THEN
    RAISE EXCEPTION '15-day full journey streak required';
  END IF;

  INSERT INTO public.edubite_monthly_challenge_entries (
    user_id,
    month_key,
    answer,
    display_name,
    submitted_at
  ) VALUES (
    uid,
    p_month_key,
    btrim(p_answer),
    left(coalesce(nullif(btrim(p_display_name), ''), 'Learner'), 80),
    now()
  )
  RETURNING submitted_at INTO inserted_at;

  current_payload := jsonb_set(
    current_payload,
    '{challengePuzzleSubmittedMonthKey}',
    to_jsonb(p_month_key),
    true
  );
  UPDATE public.edubite_game_state
  SET payload = current_payload, updated_at = now()
  WHERE user_id = uid;

  RETURN jsonb_build_object('submittedAt', inserted_at, 'state', current_payload);
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'challenge entry already submitted';
END;
$$;

CREATE FUNCTION public.edubite_submit_monthly_challenge(
  p_month_key text,
  p_answer text,
  p_display_name text,
  p_date_key text DEFAULT NULL
) RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT edubite_private.submit_monthly_challenge(
    p_month_key,
    p_answer,
    p_display_name,
    p_date_key
  );
$$;

REVOKE ALL ON FUNCTION edubite_private.submit_monthly_challenge(text, text, text, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION edubite_private.submit_monthly_challenge(text, text, text, text)
  TO authenticated;
REVOKE ALL ON FUNCTION public.edubite_submit_monthly_challenge(text, text, text, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.edubite_submit_monthly_challenge(text, text, text, text)
  TO authenticated;

DROP FUNCTION IF EXISTS public.edubite_monthly_challenge_winners(text);
CREATE FUNCTION public.edubite_monthly_challenge_winners(
  p_month_key text
) RETURNS TABLE(display_name text, submitted_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT e.display_name, e.submitted_at
  FROM public.edubite_monthly_challenge_entries e
  WHERE e.month_key = p_month_key
    AND e.is_winner = true
  ORDER BY e.submitted_at ASC
  LIMIT 5;
$$;

REVOKE ALL ON FUNCTION public.edubite_monthly_challenge_winners(text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.edubite_monthly_challenge_winners(text)
  TO authenticated;

COMMENT ON FUNCTION public.edubite_save_game_state(jsonb) IS
  'Atomic, authenticated game-state save. Ignores arbitrary client RDM and protects challenge fields.';
COMMENT ON FUNCTION public.edubite_enroll_monthly_challenge(text, text, text) IS
  'Atomic Monthly Challenge enrollment and RDM stake deduction.';
COMMENT ON FUNCTION public.edubite_submit_monthly_challenge(text, text, text, text) IS
  'Atomic final entry with verified enrollment/date/streak checks (dayCriteriaLog, gap-free legacy history fallback).';
