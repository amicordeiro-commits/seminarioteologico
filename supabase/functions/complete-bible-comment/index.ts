import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { comment, verseText, bookName, chapter, verse } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Check if comment appears incomplete (ends abruptly without punctuation)
    const isIncomplete = !comment.trim().match(/[.!?:;]$/) || 
                         comment.trim().endsWith('-') ||
                         comment.trim().endsWith('­') ||
                         comment.length < 50;

    if (!isIncomplete) {
      return new Response(JSON.stringify({ completedComment: comment, wasCompleted: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Completing comment for ${bookName} ${chapter}:${verse}`);
    console.log(`Original: "${comment.substring(0, 100)}..."`);

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
1. Continue o comentário de forma natural e coerente com o início fornecido
2. Mantenha o mesmo tom e estilo teológico do comentário original
3. O comentário deve ser relevante para o versículo em questão
4. Seja conciso mas completo - geralmente 2-4 frases adicionais são suficientes
5. Termine com uma conclusão apropriada
6. NÃO adicione referências bíblicas extras a menos que o original já as tenha
7. Responda APENAS com o comentário completo, sem explicações adicionais`
          },
          { 
            role: "user", 
            content: `Versículo: ${bookName} ${chapter}:${verse}
Texto do versículo: "${verseText}"

Comentário incompleto para completar:
"${comment}"

Complete este comentário de forma teologicamente apropriada:`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later.", completedComment: comment, wasCompleted: false }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted.", completedComment: comment, wasCompleted: false }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI error", completedComment: comment, wasCompleted: false }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const completedComment = data.choices?.[0]?.message?.content?.trim() || comment;
    
    console.log(`Completed: "${completedComment.substring(0, 100)}..."`);

    return new Response(JSON.stringify({ 
      completedComment,
      wasCompleted: true,
      original: comment
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error completing comment:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      completedComment: null,
      wasCompleted: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
