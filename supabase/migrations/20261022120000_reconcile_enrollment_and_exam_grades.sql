-- Reconcile split Monthly Challenge enrollment, and stop game-state saves
-- from grading the wrong DailyDose questions or dropping a just-stamped score.
--
-- Enrollment: roster rows and challengeEnrolledMonthKey / challengeEnrolledMonths
-- could diverge. Saves copy those flags from the stored payload, and a repeat
-- enroll charged stake again when only the flags existed. Submit requires
-- stake_deducted_at, so flags without a roster row could not enter the puzzle.
-- This backfill joins the two records without deducting RDM again, and enroll
-- repairs whichever side is missing.
--
-- Grades: stamp_exam_grades keeps DailyDose / FunBrain scores from the previous
-- payload when a follow-up save is completed but incomplete. That snapshot has
-- to be taken after the game-state advisory lock, or a concurrent save still
-- sees the pre-stamp row and persists 0.
-- DailyDose grading must ORDER BY the same keys as row_number() before LIMIT 5.
-- The window numbers every published question; LIMIT alone can keep a different
-- five than the first five the learner answered.

DO $$
DECLARE
  rec record;
  state_payload jsonb;
  months jsonb;
  month_text text;
  latest text;
  current_key text;
  entry_stake integer;
BEGIN
  SELECT coalesce(max(amount), 3000)
  INTO entry_stake
  FROM public.edubite_rdm_rewards
  WHERE reward_key = 'challenge.entry_stake';

  FOR rec IN
    SELECT user_id FROM public.edubite_game_state
    UNION
    SELECT user_id FROM public.edubite_monthly_challenge_enrollments
  LOOP
    SELECT g.payload
    INTO state_payload
    FROM public.edubite_game_state g
    WHERE g.user_id = rec.user_id
    FOR UPDATE;

    months := '[]'::jsonb;
    IF state_payload IS NOT NULL
      AND jsonb_typeof(state_payload->'challengeEnrolledMonths') = 'array'
    THEN
      months := state_payload->'challengeEnrolledMonths';
    END IF;

    IF state_payload IS NOT NULL
      AND coalesce(state_payload->>'challengeEnrolledMonthKey', '') ~ '^\d{4}-\d{2}$'
      AND NOT months ? (state_payload->>'challengeEnrolledMonthKey')
    THEN
      months := months || to_jsonb(state_payload->>'challengeEnrolledMonthKey');
    END IF;

    FOR month_text IN
      SELECT e.month_key
      FROM public.edubite_monthly_challenge_enrollments e
      WHERE e.user_id = rec.user_id
        AND e.stake_deducted_at IS NOT NULL
      ORDER BY e.month_key
    LOOP
      IF month_text ~ '^\d{4}-\d{2}$' AND NOT months ? month_text THEN
        months := months || to_jsonb(month_text);
      END IF;
    END LOOP;

    IF state_payload IS NOT NULL THEN
      INSERT INTO public.edubite_monthly_challenge_enrollments (
        user_id,
        month_key,
        stake_rdm,
        display_name,
        enrolled_at,
        stake_deducted_at
      )
      SELECT
        rec.user_id,
        flagged.month_key,
        entry_stake,
        'Learner',
        now(),
        now()
      FROM (
        SELECT DISTINCT month_key
        FROM jsonb_array_elements_text(months) AS month_key
      ) flagged
      WHERE flagged.month_key ~ '^\d{4}-\d{2}$'
      ON CONFLICT (user_id, month_key) DO NOTHING;
    END IF;

    IF state_payload IS NULL THEN
      CONTINUE;
    END IF;

    SELECT max(m)
    INTO latest
    FROM jsonb_array_elements_text(months) AS m
    WHERE m ~ '^\d{4}-\d{2}$';

    current_key := state_payload->>'challengeEnrolledMonthKey';
    IF current_key IS NULL
      OR current_key !~ '^\d{4}-\d{2}$'
      OR NOT months ? current_key
    THEN
      current_key := latest;
    END IF;

    IF current_key IS NOT NULL
      AND (
        state_payload->'challengeEnrolledMonths' IS DISTINCT FROM months
        OR state_payload->>'challengeEnrolledMonthKey' IS DISTINCT FROM current_key
      )
    THEN
      state_payload := jsonb_set(state_payload, '{challengeEnrolledMonths}', months, true);
      state_payload := jsonb_set(
        state_payload,
        '{challengeEnrolledMonthKey}',
        to_jsonb(current_key),
        true
      );
      UPDATE public.edubite_game_state
      SET payload = state_payload, updated_at = now()
      WHERE user_id = rec.user_id;
    END IF;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION edubite_private.ensure_challenge_month_flags(
  p_user_id uuid,
  p_payload jsonb,
  p_month_key text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  months jsonb;
  next_payload jsonb;
BEGIN
  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'object' THEN
    RETURN p_payload;
  END IF;
  months := CASE
    WHEN jsonb_typeof(p_payload->'challengeEnrolledMonths') = 'array'
      THEN p_payload->'challengeEnrolledMonths'
    ELSE '[]'::jsonb
  END;
  IF NOT months ? p_month_key THEN
    months := months || to_jsonb(p_month_key);
  END IF;
  IF p_payload->>'challengeEnrolledMonthKey' IS NOT DISTINCT FROM p_month_key
    AND p_payload->'challengeEnrolledMonths' IS NOT DISTINCT FROM months
  THEN
    RETURN p_payload;
  END IF;
  next_payload := jsonb_set(
    p_payload,
    '{challengeEnrolledMonthKey}',
    to_jsonb(p_month_key),
    true
  );
  next_payload := jsonb_set(next_payload, '{challengeEnrolledMonths}', months, true);
  UPDATE public.edubite_game_state
  SET payload = next_payload, updated_at = now()
  WHERE user_id = p_user_id;
  RETURN next_payload;
END;
$$;

REVOKE ALL ON FUNCTION edubite_private.ensure_challenge_month_flags(uuid, jsonb, text)
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION edubite_private.enroll_monthly_challenge(
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
  flags_already boolean;
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
    current_payload := edubite_private.ensure_challenge_month_flags(
      uid,
      current_payload,
      p_month_key
    );
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

  flags_already := (
    jsonb_typeof(current_payload->'challengeEnrolledMonths') = 'array'
    AND current_payload->'challengeEnrolledMonths' ? p_month_key
  ) OR current_payload->>'challengeEnrolledMonthKey' = p_month_key;
  IF flags_already THEN
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
    )
    ON CONFLICT (user_id, month_key) DO NOTHING;
    current_payload := edubite_private.ensure_challenge_month_flags(
      uid,
      current_payload,
      p_month_key
    );
    RETURN jsonb_build_object(
      'alreadyEnrolled', true,
      'monthKey', p_month_key,
      'stakeRdm', stake_rdm,
      'state', current_payload
    );
  END IF;

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


CREATE OR REPLACE FUNCTION edubite_private.save_game_state(
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
      ORDER BY q.sort_order, q.id
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

CREATE OR REPLACE FUNCTION edubite_private.stamp_exam_grades(
  p_saved jsonb,
  p_prev jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  today_key text := to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD');
  schedule_date date;
  dose_class text;
  dose_answers jsonb;
  dose_correct integer := 0;
  dose_total integer := 0;
  dose_flags jsonb := '[]'::jsonb;
  fun_answers jsonb;
  fun_score integer := 0;
  fun_combo integer := 0;
  fun_correct integer := 0;
  fun_base integer := 10;
  fun_combo_bonus integer := 5;
  answer_index integer := 0;
  answer_value text;
  question_row record;
  next_payload jsonb := p_saved;
  dose_log jsonb;
  prev_high integer := 0;
  keep_dose_correct integer := 0;
  keep_fun_score integer := 0;
BEGIN
  IF p_saved IS NULL OR jsonb_typeof(p_saved) <> 'object' THEN
    RETURN p_saved;
  END IF;

  dose_log := CASE
    WHEN jsonb_typeof(p_prev->'doseDayLog') = 'object' THEN p_prev->'doseDayLog'
    ELSE '{}'::jsonb
  END;
  IF jsonb_typeof(next_payload->'doseDayLog') = 'object' THEN
    dose_log := dose_log || (next_payload->'doseDayLog');
  END IF;

  IF coalesce(p_saved->>'lastActiveDate', '') <> today_key THEN
    RETURN jsonb_set(next_payload, '{doseDayLog}', dose_log, true);
  END IF;

  SELECT
    coalesce(max(amount) FILTER (WHERE reward_key = 'funbrain.base_points'), 10),
    coalesce(max(amount) FILTER (WHERE reward_key = 'funbrain.combo_bonus'), 5)
  INTO fun_base, fun_combo_bonus
  FROM public.edubite_rdm_rewards
  WHERE reward_key IN ('funbrain.base_points', 'funbrain.combo_bonus');

  schedule_date := date '2026-01-01'
    + (((today_key::date - date '2026-01-01') % 180 + 180) % 180);
  dose_class := p_saved#>>'{dose,currentClass}';
  dose_answers := CASE dose_class
    WHEN '11' THEN coalesce(p_saved#>'{dose,answers11}', '[]'::jsonb)
    WHEN '12' THEN coalesce(p_saved#>'{dose,answers12}', '[]'::jsonb)
    ELSE '[]'::jsonb
  END;
  IF jsonb_typeof(dose_answers) <> 'array' THEN
    dose_answers := '[]'::jsonb;
  END IF;

  SELECT
    coalesce(count(*), 0)::integer,
    coalesce(count(*) FILTER (WHERE ok), 0)::integer,
    coalesce(jsonb_agg(ok ORDER BY ordinal), '[]'::jsonb)
  INTO dose_total, dose_correct, dose_flags
  FROM (
    SELECT
      qs.ordinal,
      coalesce(submitted.value, '') ~ '^\d+$'
        AND submitted.value::integer = qs.correct AS ok
    FROM (
      SELECT q.correct, row_number() OVER (ORDER BY q.sort_order, q.id) AS ordinal
      FROM public.edubite_content_questions q
      WHERE q.domain = 'dailydose'
        AND q.published = true
        AND q.class_level = dose_class
        AND q.active_date = schedule_date
      ORDER BY q.sort_order, q.id
      LIMIT 5
    ) qs
    LEFT JOIN jsonb_array_elements_text(dose_answers)
      WITH ORDINALITY AS submitted(value, ordinal)
      ON submitted.ordinal = qs.ordinal
  ) graded;

  IF coalesce(p_saved#>>'{dose,completed}', 'false') = 'true' AND dose_total > 0 THEN
    -- Regrade only when a full answer set is present. Empty/partial follow-up
    -- saves still have completed=true (client merge) and would persist 0.
    IF jsonb_array_length(dose_answers) >= dose_total THEN
      next_payload := jsonb_set(next_payload, '{dose,correct}', to_jsonb(dose_correct), true);
      IF dose_class = '11' THEN
        next_payload := jsonb_set(next_payload, '{dose,correct11}', to_jsonb(dose_correct), true);
      ELSIF dose_class = '12' THEN
        next_payload := jsonb_set(next_payload, '{dose,correct12}', to_jsonb(dose_correct), true);
      END IF;
      next_payload := jsonb_set(next_payload, '{dose,answerCorrect}', dose_flags, true);
      dose_log := jsonb_set(
        dose_log,
        ARRAY[today_key],
        jsonb_build_object(
          'correct', dose_correct,
          'total', dose_total,
          'pct', (round((100.0 * dose_correct) / dose_total))::integer,
          'completed', true,
          'classLevel', coalesce(nullif(dose_class, ''), '11')
        ),
        true
      );
    ELSE
      IF coalesce(p_prev#>>'{dose,correct}', '') ~ '^\d+$' THEN
        keep_dose_correct := (p_prev#>>'{dose,correct}')::integer;
      END IF;
      IF coalesce(next_payload#>>'{dose,correct}', '') ~ '^\d+$' THEN
        keep_dose_correct := greatest(
          keep_dose_correct,
          (next_payload#>>'{dose,correct}')::integer
        );
      END IF;
      IF keep_dose_correct > 0 THEN
        next_payload := jsonb_set(
          next_payload,
          '{dose,correct}',
          to_jsonb(keep_dose_correct),
          true
        );
        IF dose_class = '11' THEN
          next_payload := jsonb_set(
            next_payload,
            '{dose,correct11}',
            to_jsonb(keep_dose_correct),
            true
          );
        ELSIF dose_class = '12' THEN
          next_payload := jsonb_set(
            next_payload,
            '{dose,correct12}',
            to_jsonb(keep_dose_correct),
            true
          );
        END IF;
      END IF;
    END IF;
  END IF;

  fun_answers := coalesce(p_saved#>'{funbrain,answers}', '[]'::jsonb);
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
      fun_correct := fun_correct + 1;
    ELSE
      fun_combo := 0;
    END IF;
    answer_index := answer_index + 1;
  END LOOP;

  IF coalesce(p_prev#>>'{funbrain,score}', '') ~ '^\d+$' THEN
    keep_fun_score := (p_prev#>>'{funbrain,score}')::integer;
  END IF;
  IF coalesce(p_saved#>>'{funbrain,score}', '') ~ '^\d+$' THEN
    keep_fun_score := greatest(
      keep_fun_score,
      (p_saved#>>'{funbrain,score}')::integer
    );
  END IF;

  -- Regrade only from a real answer payload. Empty/partial follow-ups would
  -- force score 0 and erase the official result the wrapper is meant to stamp.
  IF coalesce(p_saved#>>'{funbrain,completed}', 'false') = 'true'
    AND jsonb_array_length(fun_answers) > 0
    AND (
      jsonb_array_length(fun_answers) >= 6
      OR keep_fun_score = 0
      OR fun_score >= keep_fun_score
    )
  THEN
    prev_high := CASE
      WHEN coalesce(p_prev#>>'{funbrain,highScore}', '') ~ '^\d+$'
        THEN (p_prev#>>'{funbrain,highScore}')::integer
      ELSE 0
    END;
    IF coalesce(p_saved#>>'{funbrain,highScore}', '') ~ '^\d+$' THEN
      prev_high := greatest(prev_high, (p_saved#>>'{funbrain,highScore}')::integer);
    END IF;
    next_payload := jsonb_set(next_payload, '{funbrain,score}', to_jsonb(fun_score), true);
    next_payload := jsonb_set(next_payload, '{funbrain,combo}', to_jsonb(fun_combo), true);
    next_payload := jsonb_set(next_payload, '{funbrain,correctCount}', to_jsonb(fun_correct), true);
    next_payload := jsonb_set(
      next_payload,
      '{funbrain,highScore}',
      to_jsonb(greatest(prev_high, fun_score)),
      true
    );
  ELSIF coalesce(p_saved#>>'{funbrain,completed}', 'false') = 'true'
    AND keep_fun_score > 0
  THEN
    next_payload := jsonb_set(
      next_payload,
      '{funbrain,score}',
      to_jsonb(keep_fun_score),
      true
    );
    prev_high := CASE
      WHEN coalesce(p_prev#>>'{funbrain,highScore}', '') ~ '^\d+$'
        THEN (p_prev#>>'{funbrain,highScore}')::integer
      ELSE 0
    END;
    IF coalesce(p_saved#>>'{funbrain,highScore}', '') ~ '^\d+$' THEN
      prev_high := greatest(prev_high, (p_saved#>>'{funbrain,highScore}')::integer);
    END IF;
    next_payload := jsonb_set(
      next_payload,
      '{funbrain,highScore}',
      to_jsonb(greatest(prev_high, keep_fun_score)),
      true
    );
  END IF;

  RETURN jsonb_set(next_payload, '{doseDayLog}', dose_log, true);
END;
$$;

CREATE OR REPLACE FUNCTION public.edubite_save_game_state(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid uuid := auth.uid();
  prev jsonb;
  saved jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  -- Same lock as edubite_private.save_game_state. Reading prev before it lets
  -- a concurrent save stamp from a pre-grade snapshot and persist score 0.
  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text || ':game-state', 0));
  SELECT payload INTO prev
  FROM public.edubite_game_state
  WHERE user_id = uid;
  saved := edubite_private.save_game_state(p_payload);
  saved := edubite_private.stamp_exam_grades(saved, coalesce(prev, '{}'::jsonb));
  UPDATE public.edubite_game_state
  SET payload = saved, updated_at = now()
  WHERE user_id = uid;
  RETURN saved;
END;
$$;
