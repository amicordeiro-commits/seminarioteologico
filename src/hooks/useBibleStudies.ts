import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BibleStudy {
  id: string;
  book_abbrev: string;
  chapter: number | null;
  verse: number | null;
  study_type: string;
  title: string;
  content: string;
  created_at: string;
}

export function useBibleStudies(bookAbbrev: string, chapter?: number) {
  return useQuery({
    queryKey: ["bible-studies", bookAbbrev, chapter],
    queryFn: async () => {
      let query = supabase
        .from("bible_studies")
        .select("*")
        .eq("book_abbrev", bookAbbrev.toLowerCase());

      // Get both book-level studies (chapter IS NULL) and chapter-specific studies
      if (chapter) {
        query = query.or(`chapter.is.null,chapter.eq.${chapter}`);
      } else {
        query = query.is("chapter", null);
      }

      const { data, error } = await query.order("verse").order("study_type");
      if (error) throw error;
      return data as BibleStudy[];
    },
    enabled: !!bookAbbrev,
  });
}

// Hook to get verse-specific studies
export function useVerseStudy(bookAbbrev: string, chapter: number, verse: number) {
  return useQuery({
    queryKey: ["verse-study", bookAbbrev, chapter, verse],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bible_studies")
        .select("*")
        .eq("book_abbrev", bookAbbrev.toLowerCase())
        .eq("chapter", chapter)
        .eq("verse", verse);

      if (error) throw error;
      return data as BibleStudy[];
    },
    enabled: !!bookAbbrev && !!chapter && !!verse,
  });
}

export function useBookIntroduction(bookAbbrev: string) {
  return useQuery({
    queryKey: ["bible-introduction", bookAbbrev],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bible_studies")
        .select("*")
        .eq("book_abbrev", bookAbbrev.toLowerCase())
        .eq("study_type", "introduction")
        .is("chapter", null)
        .maybeSingle();

      if (error) throw error;
      return data as BibleStudy | null;
    },
    enabled: !!bookAbbrev,
  });
}
