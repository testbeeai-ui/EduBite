-- Edubite DailyDose: separate Class 11 / Class 12 tracks (never merge PCM pools).
-- Independent of Edublast play_questions / mock_questions.

ALTER TABLE public.edubite_content_questions
  ADD COLUMN IF NOT EXISTS class_level text
  CHECK (class_level IS NULL OR class_level IN ('11', '12'));

COMMENT ON COLUMN public.edubite_content_questions.class_level IS
  'DailyDose PCM track: 11 or 12. NULL for funbrain. Never mix classes in one row.';

CREATE INDEX IF NOT EXISTS idx_edubite_content_questions_class_schedule
  ON public.edubite_content_questions (domain, class_level, active_date, published, sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS idx_edubite_content_questions_dailydose_slot
  ON public.edubite_content_questions (domain, class_level, active_date, sort_order)
  WHERE domain = 'dailydose' AND class_level IS NOT NULL;
