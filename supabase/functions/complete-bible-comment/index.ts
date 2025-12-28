import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function stripOuterQuotes(text: string) {
  const t = text.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

function isLikelyIncomplete(text: string) {
  const t = text.trim();
  if (!t) return true;

  // Strong signals of truncation from OCR
  if (t.endsWith("-") || t.endsWith("­")) return true;

  // If it doesn't end with punctuation, only treat as incomplete when it's long enough
  // (short comments often end without punctuation in OCR and are still "complete".)
  const endsWithPunct = /[.!?:;]$/.test(t);
  if (!endsWithPunct && t.length >= 120) return true;

  return false;
}

async function callAI({
  comment,
  verseText,
  bookName,
  chapter,
  verse,
}: {
  comment: string;
  verseText: string;
  bookName: string;
  chapter: number;
  verse: number;
}) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
          content: `Você é um teólogo e estudioso bíblico experiente. Sua tarefa é completar comentários bíblicos que foram cortados ou estão incompletos.

REGRAS IMPORTANTES:
- Continue o texto de forma natural e coerente com o início fornecido.
- Mantenha o mesmo tom e estilo do comentário original.
- Seja relevante ao versículo.
- Complete com 2–6 frases (o suficiente para finalizar a ideia) e termine com pontuação final.
- NÃO adicione referências bíblicas extras a menos que o original já as tenha.
- NÃO coloque aspas no começo/fim da resposta.
- Responda APENAS com o comentário final completo (sem explicações).`,
        },
        {
          role: "user",
          content: `Versículo: ${bookName} ${chapter}:${verse}
Texto do versículo:
${verseText}

Comentário incompleto para completar:
${comment}

Complete e finalize este comentário:`,
        },
      ],
      max_tokens: 700,
      temperature: 0.7,
    }),
  });

  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { comment, verseText, bookName, chapter, verse } = await req.json();

    if (!comment || typeof comment !== "string") {
      return new Response(JSON.stringify({ error: "Missing comment" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If it's not incomplete, just return as-is.
    if (!isLikelyIncomplete(comment)) {
      return new Response(JSON.stringify({ completedComment: comment, wasCompleted: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Completing comment for ${bookName} ${chapter}:${verse}`);

    let current = comment;
    let wasCompleted = false;

    // Up to 2 passes to avoid still-truncated endings.
    for (let attempt = 1; attempt <= 2; attempt++) {
      const resp = await callAI({ comment: current, verseText, bookName, chapter, verse });

      if (!resp.ok) {
        if (resp.status === 429) {
          return new Response(
            JSON.stringify({
              error: "Rate limit exceeded. Try again later.",
              completedComment: comment,
              wasCompleted: false,
            }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        if (resp.status === 402) {
          return new Response(
            JSON.stringify({
              error: "AI credits exhausted.",
              completedComment: comment,
              wasCompleted: false,
            }),
            {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const t = await resp.text();
        console.error("AI gateway error:", resp.status, t);
        return new Response(JSON.stringify({ error: "AI error", completedComment: comment, wasCompleted: false }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await resp.json();
      const modelText = stripOuterQuotes(data?.choices?.[0]?.message?.content ?? "");
      const next = modelText || current;

      current = next;
      wasCompleted = true;

      // If it's now complete, stop.
      if (!isLikelyIncomplete(current)) break;

      console.log(`Attempt ${attempt}: still looks incomplete, retrying...`);
    }

    // Ensure it ends with punctuation.
    if (current && !/[.!?:;]$/.test(current.trim())) {
      current = current.trimEnd() + ".";
    }

    return new Response(
      JSON.stringify({
        completedComment: current,
        wasCompleted,
        original: comment,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error completing comment:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        completedComment: null,
        wasCompleted: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
