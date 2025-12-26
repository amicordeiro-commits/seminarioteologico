-- Create table to store Strong's Portuguese translations
CREATE TABLE public.strongs_translations (
  strongs_id TEXT PRIMARY KEY,
  original_word TEXT,
  portuguese_word TEXT NOT NULL,
  portuguese_definition TEXT NOT NULL,
  portuguese_usage TEXT,
  transliteration TEXT,
  part_of_speech TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.strongs_translations ENABLE ROW LEVEL SECURITY;

-- Everyone can read translations (for offline sync)
CREATE POLICY "Anyone can read translations"
ON public.strongs_translations
FOR SELECT
USING (true);

-- Only admins can modify translations
CREATE POLICY "Admins can insert translations"
ON public.strongs_translations
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update translations"
ON public.strongs_translations
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_strongs_translations_id ON public.strongs_translations(strongs_id);

-- Trigger for updated_at
CREATE TRIGGER update_strongs_translations_updated_at
BEFORE UPDATE ON public.strongs_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();