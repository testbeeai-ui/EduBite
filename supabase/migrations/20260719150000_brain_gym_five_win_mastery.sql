-- Brain Gym mastery is server-authoritative:
-- Easy and Medium lock independently after five wins per game; Hard is unlimited.

DROP FUNCTION IF EXISTS public.edubite_apply_brain_gym_session(jsonb, text, integer);
DROP FUNCTION IF EXISTS public.edubite_apply_brain_gym_mutation(jsonb, jsonb);

CREATE SCHEMA IF NOT EXISTS edubite_private;
REVOKE ALL ON SCHEMA edubite_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA edubite_private TO authenticated;

DROP FUNCTION IF EXISTS edubite_private.apply_brain_gym_mutation(jsonb, jsonb);

CREATE FUNCTION edubite_private.apply_brain_gym_mutation(
  p_progress jsonb,
  p_mutation jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid uuid := auth.uid();
  mutation_type text := coalesce(p_mutation->>'type', '');
  current_progress jsonb;
  next_progress jsonb;
  game_payload jsonb;
  game_id text;
  difficulty text;
  session_id text;
  reward_claim_id text;
  won boolean;
  is_daily boolean;
  score integer;
  time_ms integer;
  awarded integer := 0;
  existing_award integer;
  current_rdm numeric;
  current_game jsonb;
  next_game jsonb;
  difficulty_wins jsonb;
  wins_before integer;
  game_plays integer;
  game_wins integer;
  total_plays integer;
  total_wins integer;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF mutation_type NOT IN ('initialize', 'sound', 'favorite', 'session') THEN
    RAISE EXCEPTION 'invalid brain gym mutation';
  END IF;

  -- Serialize all Brain Gym mutations for a user, including their first row.
  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text, 0));

  SELECT payload
  INTO current_progress
  FROM public.edubite_brain_gym_progress
  WHERE user_id = uid
  FOR UPDATE;

  IF mutation_type = 'initialize' THEN
    current_progress := coalesce(current_progress, p_progress);
    current_progress := jsonb_set(current_progress, '{version}', '2'::jsonb, true);

  ELSIF mutation_type = 'sound' THEN
    current_progress := coalesce(current_progress, p_progress);
    current_progress := jsonb_set(
      current_progress,
      '{soundEnabled}',
      to_jsonb(coalesce((p_mutation->>'enabled')::boolean, true)),
      true
    );

  ELSIF mutation_type = 'favorite' THEN
    current_progress := coalesce(current_progress, p_progress);
    game_id := p_mutation->>'gameId';
    IF game_id IS NULL OR game_id = '' THEN
      RAISE EXCEPTION 'invalid favorite game';
    END IF;
    current_game := coalesce(
      current_progress#>ARRAY['games', game_id],
      p_progress#>ARRAY['games', game_id],
      '{}'::jsonb
    );
    current_game := jsonb_set(
      current_game,
      '{favorite}',
      to_jsonb(coalesce((p_mutation->>'favorite')::boolean, false)),
      true
    );
    current_progress := jsonb_set(
      current_progress,
      ARRAY['games', game_id],
      current_game,
      true
    );

  ELSE
    game_id := p_mutation->>'gameId';
    difficulty := p_mutation#>>'{result,difficulty}';
    session_id := p_mutation->>'sessionId';
    won := coalesce((p_mutation#>>'{result,won}')::boolean, false);
    is_daily := coalesce((p_mutation->>'isDaily')::boolean, false);
    score := greatest(0, least(1000000, coalesce((p_mutation#>>'{result,score}')::integer, 0)));
    time_ms := greatest(0, least(86400000, coalesce((p_mutation#>>'{result,timeMs}')::integer, 0)));

    IF game_id IS NULL OR game_id = '' THEN
      RAISE EXCEPTION 'invalid session game';
    END IF;
    IF difficulty NOT IN ('easy', 'medium', 'hard') THEN
      RAISE EXCEPTION 'invalid session difficulty';
    END IF;
    IF session_id IS NULL OR session_id !~* '^[0-9a-f-]{36}$' THEN
      RAISE EXCEPTION 'invalid session id';
    END IF;

    reward_claim_id := 'brain-gym-session:' || session_id;
    SELECT rdm_awarded
    INTO existing_award
    FROM public.edubite_reward_claims
    WHERE user_id = uid
      AND edubite_reward_claims.claim_id = reward_claim_id;

    IF existing_award IS NOT NULL THEN
      SELECT payload INTO game_payload
      FROM public.edubite_game_state
      WHERE user_id = uid;
      RETURN jsonb_build_object(
        'progress', coalesce(current_progress, p_progress),
        'awarded', 0,
        'gameState', game_payload
      );
    END IF;

    current_progress := coalesce(
      current_progress,
      p_mutation->'baseProgress',
      p_progress
    );
    current_game := coalesce(current_progress#>ARRAY['games', game_id], '{}'::jsonb);
    difficulty_wins := coalesce(
      current_game->'winsByDifficulty',
      '{"easy":0,"medium":0,"hard":0}'::jsonb
    );
    wins_before := greatest(
      0,
      coalesce((difficulty_wins->>difficulty)::integer, 0)
    );

    IF difficulty IN ('easy', 'medium') AND wins_before >= 5 THEN
      RAISE EXCEPTION 'difficulty mastered';
    END IF;

    total_plays := greatest(0, coalesce((current_progress->>'totalPlays')::integer, 0)) + 1;
    total_wins := greatest(0, coalesce((current_progress->>'totalWins')::integer, 0))
      + CASE WHEN won THEN 1 ELSE 0 END;
    game_plays := greatest(0, coalesce((current_game->>'plays')::integer, 0)) + 1;
    game_wins := greatest(0, coalesce((current_game->>'wins')::integer, 0))
      + CASE WHEN won THEN 1 ELSE 0 END;
    difficulty_wins := jsonb_set(
      difficulty_wins,
      ARRAY[difficulty],
      to_jsonb(wins_before + CASE WHEN won THEN 1 ELSE 0 END),
      true
    );

    next_progress := p_progress;
    next_game := coalesce(next_progress#>ARRAY['games', game_id], current_game);
    next_game := jsonb_set(next_game, '{plays}', to_jsonb(game_plays), true);
    next_game := jsonb_set(next_game, '{wins}', to_jsonb(game_wins), true);
    next_game := jsonb_set(
      next_game,
      '{winsByDifficulty}',
      difficulty_wins,
      true
    );
    next_game := jsonb_set(
      next_game,
      '{favorite}',
      to_jsonb(coalesce((current_game->>'favorite')::boolean, false)),
      true
    );

    next_progress := jsonb_set(next_progress, '{version}', '2'::jsonb, true);
    next_progress := jsonb_set(next_progress, '{totalPlays}', to_jsonb(total_plays), true);
    next_progress := jsonb_set(next_progress, '{totalWins}', to_jsonb(total_wins), true);
    next_progress := jsonb_set(
      next_progress,
      ARRAY['games', game_id],
      next_game,
      true
    );
    current_progress := next_progress;

    -- Match the client reward formula, but calculate and cap it on the server.
    awarded := greatest(5, floor(score / 20.0)::integer);
    IF won THEN awarded := awarded + 15; END IF;
    IF is_daily AND won THEN awarded := awarded + 25; END IF;
    awarded := least(120, awarded);

    SELECT payload INTO game_payload
    FROM public.edubite_game_state
    WHERE user_id = uid
    FOR UPDATE;

    IF game_payload IS NULL THEN
      game_payload := jsonb_build_object('rdm', awarded, 'signedIn', true);
    ELSE
      current_rdm := coalesce((game_payload->>'rdm')::numeric, 0);
      game_payload := jsonb_set(
        game_payload,
        '{rdm}',
        to_jsonb(current_rdm + awarded),
        true
      );
      game_payload := jsonb_set(game_payload, '{signedIn}', 'true'::jsonb, true);
    END IF;

    INSERT INTO public.edubite_game_state (user_id, payload, updated_at)
    VALUES (uid, game_payload, now())
    ON CONFLICT (user_id) DO UPDATE SET
      payload = EXCLUDED.payload,
      updated_at = now();

    INSERT INTO public.edubite_reward_claims (user_id, claim_id, rdm_awarded)
    VALUES (uid, reward_claim_id, awarded);
  END IF;

  current_progress := jsonb_set(current_progress, '{version}', '2'::jsonb, true);
  INSERT INTO public.edubite_brain_gym_progress (user_id, payload, updated_at)
  VALUES (uid, current_progress, now())
  ON CONFLICT (user_id) DO UPDATE SET
    payload = EXCLUDED.payload,
    updated_at = now();

  IF game_payload IS NULL THEN
    SELECT payload INTO game_payload
    FROM public.edubite_game_state
    WHERE user_id = uid;
  END IF;

  RETURN jsonb_build_object(
    'progress', current_progress,
    'awarded', awarded,
    'gameState', game_payload
  );
END;
$$;

REVOKE ALL ON FUNCTION edubite_private.apply_brain_gym_mutation(jsonb, jsonb)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION edubite_private.apply_brain_gym_mutation(jsonb, jsonb)
TO authenticated;

CREATE FUNCTION public.edubite_apply_brain_gym_mutation(
  p_progress jsonb,
  p_mutation jsonb
) RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT edubite_private.apply_brain_gym_mutation(p_progress, p_mutation);
$$;

REVOKE ALL ON FUNCTION public.edubite_apply_brain_gym_mutation(jsonb, jsonb)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.edubite_apply_brain_gym_mutation(jsonb, jsonb)
TO authenticated;
