import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StrongsEntry {
  Gk_word?: string;
  Hb_word?: string;
  transliteration: string;
  strongs_def: string;
  part_of_speech: string;
  root_word: string;
  occurrences: string;
  outline_usage: string;
}

interface TranslationResult {
  strongs_id: string;
  original_word: string;
  portuguese_word: string;
  portuguese_definition: string;
  portuguese_usage: string;
  transliteration: string;
  part_of_speech: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { entries, batchSize = 10 } = await req.json();

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return new Response(
        JSON.stringify({ error: "Entries array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing batch of ${entries.length} Strong's entries`);

    // Process in smaller chunks to avoid rate limits
    const results: TranslationResult[] = [];
    const chunks = [];
    
    for (let i = 0; i < entries.length; i += batchSize) {
      chunks.push(entries.slice(i, i + batchSize));
    }

    for (const chunk of chunks) {
      const entriesText = chunk.map((e: { id: string; entry: StrongsEntry }) => {
        const word = e.entry.Gk_word || e.entry.Hb_word || e.entry.transliteration;
        const def = cleanText(e.entry.strongs_def || e.entry.outline_usage);
        const usage = cleanText(e.entry.outline_usage);
        return `${e.id}: ${word} - ${def} | Usage: ${usage}`;
      }).join("\n");

      const prompt = `Traduza estas entradas do léxico Strong's para português brasileiro. Para cada entrada, forneça:
1. A palavra traduzida para português
2. Uma definição concisa em português (máximo 15 palavras)
3. Uma descrição de uso em português (máximo 20 palavras)

Entradas:
${entriesText}

Responda APENAS em formato JSON válido como este exemplo:
{
  "translations": [
    {"id": "H1", "word": "pai", "definition": "pai, antepassado", "usage": "pai de família, ancestral"},
    {"id": "G26", "word": "amor", "definition": "amor divino, ágape", "usage": "amor sacrificial de Deus"}
  ]
}`;

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { 
                role: "system", 
                content: "Você é um tradutor especializado em léxico bíblico hebraico e grego. Traduza com precisão teológica para português brasileiro. Responda APENAS com JSON válido." 
              },
              { role: "user", content: prompt }
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.log("Rate limit hit, waiting...");
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          const errorText = await response.text();
          console.error("AI API error:", response.status, errorText);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.translations && Array.isArray(parsed.translations)) {
              for (const t of parsed.translations) {
                const originalEntry = chunk.find((e: { id: string }) => e.id === t.id);
                if (originalEntry) {
                  results.push({
                    strongs_id: t.id,
                    original_word: originalEntry.entry.Gk_word || originalEntry.entry.Hb_word || "",
                    portuguese_word: t.word || "",
                    portuguese_definition: t.definition || "",
                    portuguese_usage: t.usage || "",
                    transliteration: originalEntry.entry.transliteration || "",
                    part_of_speech: originalEntry.entry.part_of_speech || "",
                  });
                }
              }
            }
          } catch (parseError) {
            console.error("JSON parse error:", parseError);
          }
        }

        // Small delay between chunks to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (chunkError) {
        console.error("Chunk processing error:", chunkError);
      }
    }

    // Save translations to database
    if (results.length > 0) {
      const { error: upsertError } = await supabase
        .from("strongs_translations")
        .upsert(results, { onConflict: "strongs_id" });

      if (upsertError) {
        console.error("Database upsert error:", upsertError);
      } else {
        console.log(`Saved ${results.length} translations to database`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        translated: results.length,
        total_requested: entries.length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in translate-strongs-batch:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/&#8212-/g, "—")
    .replace(/&#8212/g, "—")
    .replace(/&quot-/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/null/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}
