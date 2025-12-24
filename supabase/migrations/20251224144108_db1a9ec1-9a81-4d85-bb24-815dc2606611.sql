-- Create bible_verses table
CREATE TABLE public.bible_verses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  translation text NOT NULL,
  book_abbrev text NOT NULL,
  book_name text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_bible_verses_translation ON public.bible_verses(translation);
CREATE INDEX idx_bible_verses_book ON public.bible_verses(book_abbrev);
CREATE INDEX idx_bible_verses_chapter ON public.bible_verses(book_abbrev, chapter);
CREATE INDEX idx_bible_verses_search ON public.bible_verses USING gin(to_tsvector('portuguese', text));

-- Enable RLS
ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;

-- Public read access for all authenticated users
CREATE POLICY "Bible verses are viewable by authenticated users"
ON public.bible_verses
FOR SELECT
USING (true);