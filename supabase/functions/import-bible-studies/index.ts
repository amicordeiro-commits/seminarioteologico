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
  cross_references?: string[];
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

    const { bibleData, clearExisting } = await req.json() as { bibleData: BibleJSON; clearExisting?: boolean };

    if (!bibleData || !bibleData.bible_content) {
      console.error("Invalid bible data format received");
      return new Response(
        JSON.stringify({ error: "Invalid bible data format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Starting import of ${bibleData.bible_content.length} books`);

    // Optionally clear existing studies
    if (clearExisting) {
      console.log("Clearing existing studies...");
      const { error: deleteError } = await supabase
        .from("bible_studies")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
      
      if (deleteError) {
        console.error("Error clearing existing studies:", deleteError);
      } else {
        console.log("Existing studies cleared");
      }
    }

    let totalImported = 0;
    let totalSkipped = 0;
    const errors: string[] = [];
    const batchSize = 100;
    let batch: any[] = [];

    for (const book of bibleData.bible_content) {
      const bookAbbrev = book.abbrev.toLowerCase();
      console.log(`Processing book: ${book.title} (${bookAbbrev})`);
      
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          if (verse.studies && verse.studies.length > 0) {
            for (const studyContent of verse.studies) {
              if (studyContent && studyContent.trim().length > 20) {
                // Clean up the study content
                const cleanContent = studyContent
                  .replace(/\s+/g, ' ')
                  .trim();
                
                // Create a title from the first sentence or first 80 chars
                const titleMatch = cleanContent.match(/^([^.!?]+[.!?])/);
                let title = titleMatch 
                  ? titleMatch[1].substring(0, 100).trim()
                  : cleanContent.substring(0, 60).trim() + '...';
                
                // If title is too short, use verse reference
                if (title.length < 15) {
                  title = `Estudo ${book.title} ${chapter.chapter_number}:${verse.verse_number}`;
                }

                batch.push({
                  book_abbrev: bookAbbrev,
                  chapter: chapter.chapter_number,
                  verse: verse.verse_number,
                  study_type: "commentary",
                  title: title,
                  content: cleanContent,
                });

                // Insert in batches
                if (batch.length >= batchSize) {
                  try {
                    const { error } = await supabase
                      .from("bible_studies")
                      .insert(batch);

                    if (error) {
                      console.error(`Batch insert error: ${error.message}`);
                      errors.push(`Batch error: ${error.message}`);
                    } else {
                      totalImported += batch.length;
                      console.log(`Imported batch: ${totalImported} total`);
                    }
                  } catch (e: unknown) {
                    const errorMessage = e instanceof Error ? e.message : String(e);
                    console.error(`Batch exception: ${errorMessage}`);
                    errors.push(`Batch exception: ${errorMessage}`);
                  }
                  batch = [];
                }
              } else {
                totalSkipped++;
              }
            }
          }
        }
      }
    }

    // Insert remaining batch
    if (batch.length > 0) {
      try {
        const { error } = await supabase
          .from("bible_studies")
          .insert(batch);

        if (error) {
          console.error(`Final batch insert error: ${error.message}`);
          errors.push(`Final batch error: ${error.message}`);
        } else {
          totalImported += batch.length;
          console.log(`Imported final batch: ${totalImported} total`);
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error(`Final batch exception: ${errorMessage}`);
        errors.push(`Final batch exception: ${errorMessage}`);
      }
    }

    console.log(`Import complete: ${totalImported} imported, ${totalSkipped} skipped`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalImported,
        totalSkipped,
        errors: errors.slice(0, 20)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Import error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
