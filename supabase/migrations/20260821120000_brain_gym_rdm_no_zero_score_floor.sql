-- Brain Gym RDM: no free min_base when score is 0.
-- Positive scores still use max(min_base, floor(score/divisor)).

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
