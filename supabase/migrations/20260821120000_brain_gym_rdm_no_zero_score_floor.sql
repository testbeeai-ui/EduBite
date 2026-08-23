-- Brain Gym RDM: no free min_base when score is 0.
-- Positive scores still use max(min_base, floor(score/divisor)).
-- Live signed-in awards go through apply_brain_gym_mutation, so wire the
-- helper there. Amounts come from edubite_rdm_rewards via rdm_amount.

CREATE OR REPLACE FUNCTION edubite_private.rdm_amount(
  p_key text,
  p_fallback integer
) RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT coalesce(
    (
      SELECT amount
      FROM public.edubite_rdm_rewards
      WHERE reward_key = p_key
    ),
    p_fallback
  );
$$;

CREATE OR REPLACE FUNCTION edubite_private.brain_gym_session_rdm(
  score integer,
  won boolean,
  is_daily boolean
) RETURNS integer
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  min_base integer := edubite_private.rdm_amount('brain_gym.min_base', 5);
  divisor integer := greatest(1, edubite_private.rdm_amount('brain_gym.score_divisor', 20));
  win_bonus integer := edubite_private.rdm_amount('brain_gym.win_bonus', 15);
  daily_bonus integer := edubite_private.rdm_amount('brain_gym.daily_win_bonus', 25);
  session_cap integer := edubite_private.rdm_amount('brain_gym.session_cap', 120);
  awarded integer := 0;
BEGIN
  IF coalesce(score, 0) > 0 THEN
    awarded := greatest(min_base, floor(score::numeric / divisor)::integer);
  END IF;
  IF coalesce(won, false) THEN
    awarded := awarded + win_bonus;
  END IF;
  IF coalesce(is_daily, false) AND coalesce(won, false) THEN
    awarded := awarded + daily_bonus;
  END IF;
  awarded := least(session_cap, awarded);
  RETURN awarded;
END;
$$;

REVOKE ALL ON FUNCTION edubite_private.rdm_amount(text, integer)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION edubite_private.brain_gym_session_rdm(integer, boolean, boolean)
FROM PUBLIC, anon, authenticated;

DO $migration$
DECLARE
  function_definition text;
  old_award text :=
    'awarded := greatest(5, floor(score / 20.0)::integer);';
  new_award text :=
    'awarded := edubite_private.brain_gym_session_rdm(score, won, is_daily);';
BEGIN
  SELECT pg_get_functiondef(p.oid)
  INTO function_definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'edubite_private'
    AND p.proname = 'apply_brain_gym_mutation'
    AND pg_get_function_identity_arguments(p.oid) = 'p_progress jsonb, p_mutation jsonb';

  IF function_definition IS NULL THEN
    RAISE EXCEPTION 'Brain Gym mutation function is missing';
  END IF;

  IF position(new_award IN function_definition) > 0 THEN
    RETURN;
  END IF;

  IF position(old_award IN function_definition) = 0 THEN
    RAISE EXCEPTION 'Unexpected Brain Gym reward formula';
  END IF;

  function_definition := replace(function_definition, old_award, new_award);
  function_definition := replace(
    function_definition,
    'IF won THEN awarded := awarded + 15; END IF;',
    ''
  );
  function_definition := replace(
    function_definition,
    'IF is_daily AND won THEN awarded := awarded + 25; END IF;',
    ''
  );
  function_definition := replace(
    function_definition,
    'awarded := least(120, awarded);',
    ''
  );

  IF position(new_award IN function_definition) = 0 THEN
    RAISE EXCEPTION 'Failed to wire Brain Gym session RDM helper';
  END IF;
  IF position(old_award IN function_definition) > 0
    OR position('IF won THEN awarded := awarded + 15; END IF;' IN function_definition) > 0
    OR position('IF is_daily AND won THEN awarded := awarded + 25; END IF;' IN function_definition) > 0
    OR position('awarded := least(120, awarded);' IN function_definition) > 0
  THEN
    RAISE EXCEPTION 'Legacy Brain Gym reward formula is still present';
  END IF;

  EXECUTE function_definition;
END
$migration$;
