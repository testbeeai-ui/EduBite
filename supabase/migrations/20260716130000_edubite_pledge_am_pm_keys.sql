-- Allow AM + PM packs to share day numbers via composite keys.
-- Applied on TestBee; kept for Edubite repo history.

ALTER TABLE public.edubite_pledge_reel_slides
  DROP CONSTRAINT IF EXISTS edubite_pledge_reel_slides_day_fkey;

ALTER TABLE public.edubite_pledge_reel_slides
  DROP CONSTRAINT IF EXISTS edubite_pledge_reel_slides_day_slide_index_key;

ALTER TABLE public.edubite_pledge_reel_slides
  ADD COLUMN IF NOT EXISTS pledge_slot text;

UPDATE public.edubite_pledge_reel_slides
SET pledge_slot = 'pm'
WHERE pledge_slot IS NULL;

ALTER TABLE public.edubite_pledge_reel_slides
  ALTER COLUMN pledge_slot SET NOT NULL;

ALTER TABLE public.edubite_pledge_reel_slides
  DROP CONSTRAINT IF EXISTS edubite_pledge_reel_slides_pledge_slot_check;

ALTER TABLE public.edubite_pledge_reel_slides
  ADD CONSTRAINT edubite_pledge_reel_slides_pledge_slot_check
  CHECK (pledge_slot IN ('am', 'pm'));

ALTER TABLE public.edubite_pledge_reel_days
  DROP CONSTRAINT IF EXISTS edubite_pledge_reel_days_pkey;

ALTER TABLE public.edubite_pledge_reel_days
  ADD PRIMARY KEY (pledge_slot, day);

ALTER TABLE public.edubite_pledge_reel_slides
  ADD CONSTRAINT edubite_pledge_reel_slides_slot_day_slide_key
  UNIQUE (pledge_slot, day, slide_index);

ALTER TABLE public.edubite_pledge_reel_slides
  ADD CONSTRAINT edubite_pledge_reel_slides_day_fkey
  FOREIGN KEY (pledge_slot, day)
  REFERENCES public.edubite_pledge_reel_days (pledge_slot, day)
  ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_edubite_pledge_slides_slot_day
  ON public.edubite_pledge_reel_slides (pledge_slot, day, slide_index);
