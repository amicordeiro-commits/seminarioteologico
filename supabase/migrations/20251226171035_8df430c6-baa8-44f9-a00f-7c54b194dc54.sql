-- Tabela para favoritos/marcadores de versículos
CREATE TABLE public.bible_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL,
  book_abbrev TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  verse_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para notas pessoais nos versículos
CREATE TABLE public.bible_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL,
  book_abbrev TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_bible_bookmarks_user ON public.bible_bookmarks(user_id);
CREATE INDEX idx_bible_bookmarks_verse ON public.bible_bookmarks(verse_id);
CREATE UNIQUE INDEX idx_bible_bookmarks_unique ON public.bible_bookmarks(user_id, verse_id);

CREATE INDEX idx_bible_notes_user ON public.bible_notes(user_id);
CREATE INDEX idx_bible_notes_verse ON public.bible_notes(verse_id);
CREATE UNIQUE INDEX idx_bible_notes_unique ON public.bible_notes(user_id, verse_id);

-- Habilitar RLS
ALTER TABLE public.bible_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_notes ENABLE ROW LEVEL SECURITY;

-- Políticas para bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.bible_bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
ON public.bible_bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.bible_bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para notes
CREATE POLICY "Users can view their own notes"
ON public.bible_notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
ON public.bible_notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON public.bible_notes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON public.bible_notes FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at nas notas
CREATE TRIGGER update_bible_notes_updated_at
BEFORE UPDATE ON public.bible_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();