-- Create table for Bible study notes (integrated with BibleReader)
CREATE TABLE public.bible_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_abbrev TEXT NOT NULL,
  chapter INTEGER,
  study_type TEXT NOT NULL DEFAULT 'commentary',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bible_studies ENABLE ROW LEVEL SECURITY;

-- Studies are viewable by all authenticated users
CREATE POLICY "Bible studies are viewable by authenticated users" 
ON public.bible_studies 
FOR SELECT 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_bible_studies_book ON public.bible_studies(book_abbrev);
CREATE INDEX idx_bible_studies_type ON public.bible_studies(study_type);