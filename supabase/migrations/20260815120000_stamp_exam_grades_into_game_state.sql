-- Write official DailyDose / FunBrain scores into the existing game-state
-- fields web already uses (dose.correct, doseDayLog, funbrain.score).
-- edubite_private.save_game_state already graded for RDM but left those
-- payload keys as the client sent them (mobile sends 0).

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
      LIMIT 5
    ) qs
    LEFT JOIN jsonb_array_elements_text(dose_answers)
      WITH ORDINALITY AS submitted(value, ordinal)
      ON submitted.ordinal = qs.ordinal
  ) graded;

  IF coalesce(p_saved#>>'{dose,completed}', 'false') = 'true' AND dose_total > 0 THEN
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

  IF coalesce(p_saved#>>'{funbrain,completed}', 'false') = 'true' THEN
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
  END IF;

  RETURN jsonb_set(next_payload, '{doseDayLog}', dose_log, true);
END;
$$;

REVOKE ALL ON FUNCTION edubite_private.stamp_exam_grades(jsonb, jsonb)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION edubite_private.stamp_exam_grades(jsonb, jsonb)
  TO authenticated;

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

REVOKE ALL ON FUNCTION public.edubite_save_game_state(jsonb)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.edubite_save_game_state(jsonb)
  TO authenticated;
