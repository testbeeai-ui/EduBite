-- Edubite RDM award schedule (admin-throttleable).
-- Applied via Supabase MCP; kept here for repo history.

CREATE TABLE IF NOT EXISTS public.edubite_rdm_rewards (
  reward_key text PRIMARY KEY,
  category text NOT NULL,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  amount integer NOT NULL CHECK (amount >= 0),
  unit text NOT NULL DEFAULT 'rdm',
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.edubite_rdm_rewards IS
  'Edubite RDM award amounts (DailyDose, Habits, FunBrain, Brain Gym, thresholds). Editable in admin.';

ALTER TABLE public.edubite_rdm_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS edubite_rdm_rewards_select_all ON public.edubite_rdm_rewards;
CREATE POLICY edubite_rdm_rewards_select_all
  ON public.edubite_rdm_rewards
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS edubite_rdm_rewards_admin_update ON public.edubite_rdm_rewards;
CREATE POLICY edubite_rdm_rewards_admin_update
  ON public.edubite_rdm_rewards
  FOR UPDATE
  TO authenticated
  USING (public.edubite_is_content_admin())
  WITH CHECK (public.edubite_is_content_admin());

DROP POLICY IF EXISTS edubite_rdm_rewards_admin_insert ON public.edubite_rdm_rewards;
CREATE POLICY edubite_rdm_rewards_admin_insert
  ON public.edubite_rdm_rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (public.edubite_is_content_admin());

INSERT INTO public.edubite_rdm_rewards (reward_key, category, label, description, amount, unit, sort_order)
VALUES
  ('dose.per_correct', 'DailyDose', 'Per correct answer', 'RDM credited for each correct DailyDose question (replay does not re-farm).', 45, 'rdm', 10),
  ('habit.sleep', 'Habits', '7–8 hrs sleep', 'RDM when this habit is checked for the day.', 15, 'rdm', 20),
  ('habit.water', 'Habits', 'Hydration · 8 glasses', 'RDM when this habit is checked for the day.', 10, 'rdm', 21),
  ('habit.eyes', 'Habits', '20‑20‑20 eye breaks', 'RDM when this habit is checked for the day.', 8, 'rdm', 22),
  ('habit.move', 'Habits', '10‑min movement break', 'RDM when this habit is checked for the day.', 10, 'rdm', 23),
  ('habit.pomodoro', 'Habits', 'Pomodoro technique', 'RDM when this habit is checked for the day.', 12, 'rdm', 24),
  ('habit.noscreen', 'Habits', 'No‑screen wind‑down', 'RDM when this habit is checked for the day.', 10, 'rdm', 25),
  ('habit.meals', 'Habits', 'No skipped meals', 'RDM when this habit is checked for the day.', 12, 'rdm', 26),
  ('habit.noai', 'Habits', 'Use AI responsibly', 'RDM when this habit is checked for the day.', 15, 'rdm', 27),
  ('funbrain.base_points', 'FunBrain', 'Base points per correct', 'Score points (1:1 RDM) for a correct answer with 0 combo.', 10, 'points', 30),
  ('funbrain.combo_bonus', 'FunBrain', 'Combo bonus per streak', 'Extra score points per combo step (becomes RDM 1:1).', 5, 'points', 31),
  ('brain_gym.min_base', 'Brain Gym', 'Minimum session RDM', 'Floor used in max(min_base, floor(score / divisor)).', 5, 'rdm', 40),
  ('brain_gym.score_divisor', 'Brain Gym', 'Score ÷ divisor', 'Divisor in floor(score / divisor) for session RDM.', 20, 'divisor', 41),
  ('brain_gym.win_bonus', 'Brain Gym', 'Win bonus', 'Extra RDM when the session is won.', 15, 'rdm', 42),
  ('brain_gym.daily_win_bonus', 'Brain Gym', 'Daily challenge win bonus', 'Extra RDM when the daily challenge is won.', 25, 'rdm', 43),
  ('brain_gym.session_cap', 'Brain Gym', 'Session RDM cap', 'Maximum RDM awarded for a single Brain Gym session.', 120, 'rdm', 44),
  ('challenge.target_rdm', 'Challenge', 'Monthly Challenge unlock', 'RDM balance required to unlock Monthly Challenge entry.', 5000, 'rdm', 50)
ON CONFLICT (reward_key) DO UPDATE SET
  category = EXCLUDED.category,
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  unit = EXCLUDED.unit,
  sort_order = EXCLUDED.sort_order;
