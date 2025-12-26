import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BibleVerse {
  verse_number: number;
  text: string;
  studies: string[];
  id: string;
  tags?: string[];
}

interface BibleChapter {
  chapter_number: number;
  verses: BibleVerse[];
}

interface BibleBook {
  title: string;
  abbrev: string;
  chapters: BibleChapter[];
}

interface BibleJSON {
  info: {
    title: string;
  };
  bible_content: BibleBook[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bibleData } = await req.json() as { bibleData: BibleJSON };

    if (!bibleData || !bibleData.bible_content) {
      return new Response(
        JSON.stringify({ error: "Invalid bible data format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    let totalImported = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    for (const book of bibleData.bible_content) {
      const bookAbbrev = book.abbrev.toLowerCase();
      
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          if (verse.studies && verse.studies.length > 0) {
            for (const studyContent of verse.studies) {
              if (studyContent && studyContent.trim().length > 10) {
                // Clean up the study content
                const cleanContent = studyContent
                  .replace(/\s+/g, ' ')
                  .trim();
                
                // Create a title from the first line or first 50 chars
                const titleMatch = cleanContent.match(/^([^.!?]+[.!?])/);
                let title = titleMatch 
                  ? titleMatch[1].substring(0, 100)
                  : cleanContent.substring(0, 50) + '...';
                
                // If title is too short, use verse reference
                if (title.length < 10) {
                  title = `Estudo ${book.title} ${chapter.chapter_number}:${verse.verse_number}`;
                }

                try {
                  const { error } = await supabase
                    .from("bible_studies")
                    .insert({
                      book_abbrev: bookAbbrev,
                      chapter: chapter.chapter_number,
                      verse: verse.verse_number,
                      study_type: "commentary",
                      title: title,
                      content: cleanContent,
                    });

                  if (error) {
                    errors.push(`${bookAbbrev} ${chapter.chapter_number}:${verse.verse_number} - ${error.message}`);
                  } else {
                    totalImported++;
                  }
                } catch (e: unknown) {
                  const errorMessage = e instanceof Error ? e.message : String(e);
                  errors.push(`${bookAbbrev} ${chapter.chapter_number}:${verse.verse_number} - ${errorMessage}`);
                }
              } else {
                totalSkipped++;
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalImported,
        totalSkipped,
        errors: errors.slice(0, 20) // Return first 20 errors only
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
