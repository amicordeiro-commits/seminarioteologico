-- Add verse column to bible_studies table for verse-specific comments
ALTER TABLE public.bible_studies ADD COLUMN IF NOT EXISTS verse integer DEFAULT NULL;

-- Create index for better performance on verse queries
CREATE INDEX IF NOT EXISTS idx_bible_studies_verse ON public.bible_studies(book_abbrev, chapter, verse);