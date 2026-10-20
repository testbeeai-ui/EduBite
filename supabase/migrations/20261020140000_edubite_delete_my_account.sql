-- Signed-in users can delete their own EduBite progress.
-- auth.users is shared with Edublast, so this does not remove that login.

CREATE OR REPLACE FUNCTION public.edubite_delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.edubite_reward_claims WHERE user_id = uid;
  DELETE FROM public.edubite_monthly_challenge_entries WHERE user_id = uid;
  DELETE FROM public.edubite_monthly_challenge_enrollments WHERE user_id = uid;
  DELETE FROM public.edubite_puzzle_progress WHERE user_id = uid;
  DELETE FROM public.edubite_brain_gym_progress WHERE user_id = uid;
  DELETE FROM public.edubite_game_state WHERE user_id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.edubite_delete_my_account() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.edubite_delete_my_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.edubite_delete_my_account() TO authenticated;
