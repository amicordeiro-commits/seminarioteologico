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
    const { topic, bibleReference } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um escritor cristão experiente especializado em devocionais e reflexões bíblicas em português brasileiro. 
Seu estilo é profundo, inspirador e acessível. 
Você cria conteúdo que toca o coração, oferece perspectivas bíblicas práticas e incentiva a vida espiritual.
Sempre escreva em português brasileiro formal mas acolhedor.`;

    const userPrompt = topic 
      ? `Crie um devocional/reflexão cristã sobre o tema: "${topic}"${bibleReference ? ` baseando-se na passagem: ${bibleReference}` : ''}.

Retorne um JSON válido com a seguinte estrutura:
{
  "title": "Título inspirador do devocional",
  "excerpt": "Um resumo de 1-2 frases do conteúdo",
  "content": "O conteúdo completo do devocional com 3-4 parágrafos bem desenvolvidos. Inclua reflexões bíblicas, aplicações práticas e uma conclusão edificante."
}`
      : `Crie um devocional/reflexão cristã inspirador sobre um tema bíblico edificante de sua escolha.

Retorne um JSON válido com a seguinte estrutura:
{
  "title": "Título inspirador do devocional",
  "excerpt": "Um resumo de 1-2 frases do conteúdo", 
  "content": "O conteúdo completo do devocional com 3-4 parágrafos bem desenvolvidos. Inclua reflexões bíblicas, aplicações práticas e uma conclusão edificante."
}`;

    console.log("Calling Lovable AI to generate devotional...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido, tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes para geração de conteúdo." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;
    
    console.log("Generated content:", generatedContent);

    // Try to parse as JSON
    let result;
    try {
      // Find JSON in the response (it might be wrapped in markdown code blocks)
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse JSON, creating structured response:", parseError);
      // If parsing fails, create a structured response from the content
      result = {
        title: "Reflexão do Dia",
        excerpt: generatedContent.substring(0, 150) + "...",
        content: generatedContent
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-devotional function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
