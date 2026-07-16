-- Edubite-only (prefix edubite_). Independent of Edublast play_questions / Web admin.
-- Applied via Supabase MCP; kept here for repo history.

CREATE OR REPLACE FUNCTION public.edubite_is_content_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) = ANY (
    ARRAY[
      'mailidpwd@gmail.com',
      'alexis36sg@gmail.com'
    ]
  );
$$;

COMMENT ON FUNCTION public.edubite_is_content_admin() IS
  'Edubite content admin allowlist (email). Independent of Edublast profiles.role / user_roles.';

REVOKE ALL ON FUNCTION public.edubite_is_content_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.edubite_is_content_admin() TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.edubite_content_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL CHECK (domain IN ('dailydose', 'funbrain')),
  active_date date NOT NULL,
  tag text,
  q text NOT NULL,
  opts jsonb NOT NULL,
  correct integer NOT NULL CHECK (correct >= 0 AND correct <= 3),
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_edubite_content_questions_schedule
  ON public.edubite_content_questions (domain, active_date, published, sort_order);

COMMENT ON TABLE public.edubite_content_questions IS
  'Edubite DailyDose/FunBrain scheduled MCQs. Separate from public.play_questions (Edublast Play hub).';

CREATE TABLE IF NOT EXISTS public.edubite_pledge_reel_days (
  day integer PRIMARY KEY CHECK (day >= 1),
  theme text NOT NULL,
  pledge_slot text NOT NULL DEFAULT 'pm' CHECK (pledge_slot IN ('am', 'pm')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.edubite_pledge_reel_days IS
  'Edubite AI integrity pledge reel day themes (am/pm packs).';

CREATE TABLE IF NOT EXISTS public.edubite_pledge_reel_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day integer NOT NULL REFERENCES public.edubite_pledge_reel_days(day) ON DELETE CASCADE,
  slide_index integer NOT NULL CHECK (slide_index >= 0 AND slide_index <= 3),
  icon text NOT NULL,
  headline text NOT NULL,
  emphasis_word text NOT NULL,
  caption text NOT NULL,
  UNIQUE (day, slide_index)
);

CREATE INDEX IF NOT EXISTS idx_edubite_pledge_reel_slides_day
  ON public.edubite_pledge_reel_slides (day, slide_index);

COMMENT ON TABLE public.edubite_pledge_reel_slides IS
  'Edubite pledge reel slides (4 per day).';

ALTER TABLE public.edubite_content_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_pledge_reel_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edubite_pledge_reel_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS edubite_content_questions_select_published ON public.edubite_content_questions;
CREATE POLICY edubite_content_questions_select_published
  ON public.edubite_content_questions
  FOR SELECT
  TO anon, authenticated
  USING (published = true OR public.edubite_is_content_admin());

DROP POLICY IF EXISTS edubite_content_questions_admin_insert ON public.edubite_content_questions;
CREATE POLICY edubite_content_questions_admin_insert
  ON public.edubite_content_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.edubite_is_content_admin());

DROP POLICY IF EXISTS edubite_content_questions_admin_update ON public.edubite_content_questions;
CREATE POLICY edubite_content_questions_admin_update
  ON public.edubite_content_questions
  FOR UPDATE
  TO authenticated
  USING (public.edubite_is_content_admin())
  WITH CHECK (public.edubite_is_content_admin());

DROP POLICY IF EXISTS edubite_content_questions_admin_delete ON public.edubite_content_questions;
CREATE POLICY edubite_content_questions_admin_delete
  ON public.edubite_content_questions
  FOR DELETE
  TO authenticated
  USING (public.edubite_is_content_admin());

DROP POLICY IF EXISTS edubite_pledge_days_select ON public.edubite_pledge_reel_days;
CREATE POLICY edubite_pledge_days_select
  ON public.edubite_pledge_reel_days
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS edubite_pledge_days_admin_all ON public.edubite_pledge_reel_days;
CREATE POLICY edubite_pledge_days_admin_all
  ON public.edubite_pledge_reel_days
  FOR ALL
  TO authenticated
  USING (public.edubite_is_content_admin())
  WITH CHECK (public.edubite_is_content_admin());

DROP POLICY IF EXISTS edubite_pledge_slides_select ON public.edubite_pledge_reel_slides;
CREATE POLICY edubite_pledge_slides_select
  ON public.edubite_pledge_reel_slides
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS edubite_pledge_slides_admin_all ON public.edubite_pledge_reel_slides;
CREATE POLICY edubite_pledge_slides_admin_all
  ON public.edubite_pledge_reel_slides
  FOR ALL
  TO authenticated
  USING (public.edubite_is_content_admin())
  WITH CHECK (public.edubite_is_content_admin());
