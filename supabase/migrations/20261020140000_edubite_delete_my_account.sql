-- Signed-in users can delete their own EduBite progress.
-- auth.users is shared with Edublast, so this does not remove that login.
--
-- Saves upsert edubite_game_state. A request that is already in flight when
-- this RPC commits would insert the row again. Block further writes from the
-- same auth session, under the same advisory lock save_game_state already
-- takes, so that late upsert cannot land. A later sign-in gets a new session
-- and can start empty.

CREATE TABLE IF NOT EXISTS edubite_private.blocked_game_state_sessions (
  user_id uuid NOT NULL,
  session_id uuid NOT NULL,
  blocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, session_id)
);

ALTER TABLE edubite_private.blocked_game_state_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE edubite_private.blocked_game_state_sessions
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION edubite_private.game_state_write_blocked()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid uuid := auth.uid();
  sid_text text := auth.jwt() ->> 'session_id';
BEGIN
  IF uid IS NULL
     OR sid_text IS NULL
     OR sid_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM edubite_private.blocked_game_state_sessions
    WHERE user_id = uid
      AND session_id = sid_text::uuid
  );
END;
$$;

REVOKE ALL ON FUNCTION edubite_private.game_state_write_blocked()
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION edubite_private.game_state_write_blocked()
  TO authenticated;

CREATE OR REPLACE FUNCTION public.edubite_delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid uuid := auth.uid();
  sid_text text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Serialize with edubite_private.save_game_state, which locks the same key
  -- before its INSERT ... ON CONFLICT upsert.
  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text || ':game-state', 0));

  DELETE FROM public.edubite_reward_claims WHERE user_id = uid;
  DELETE FROM public.edubite_monthly_challenge_entries WHERE user_id = uid;
  DELETE FROM public.edubite_monthly_challenge_enrollments WHERE user_id = uid;
  DELETE FROM public.edubite_puzzle_progress WHERE user_id = uid;
  DELETE FROM public.edubite_brain_gym_progress WHERE user_id = uid;
  DELETE FROM public.edubite_game_state WHERE user_id = uid;

  sid_text := auth.jwt() ->> 'session_id';
  IF sid_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    INSERT INTO edubite_private.blocked_game_state_sessions (user_id, session_id)
    VALUES (uid, sid_text::uuid)
    ON CONFLICT (user_id, session_id) DO NOTHING;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.edubite_delete_my_account() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.edubite_delete_my_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.edubite_delete_my_account() TO authenticated;

-- Hold the game-state lock before the upsert. A delete that already committed
-- for this session returns without inserting the row back.
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

  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text || ':game-state', 0));

  IF edubite_private.game_state_write_blocked() THEN
    SELECT payload INTO prev
    FROM public.edubite_game_state
    WHERE user_id = uid;
    RETURN coalesce(prev, '{}'::jsonb);
  END IF;

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
