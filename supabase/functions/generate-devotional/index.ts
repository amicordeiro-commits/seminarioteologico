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
  "content": "O conteúdo completo do devocional com 3-4 parágrafos bem desenvolvidos. Inclua reflexões bíblicas, aplicações práticas e uma conclusão edificante.",
  "imagePrompt": "Uma descrição em inglês de uma imagem artística e inspiradora que represente visualmente o tema do devocional. Deve ser uma cena pacífica, espiritual, com elementos bíblicos ou natureza. Exemplo: serene sunset over calm waters with a cross silhouette"
}`
      : `Crie um devocional/reflexão cristã inspirador sobre um tema bíblico edificante de sua escolha.

Retorne um JSON válido com a seguinte estrutura:
{
  "title": "Título inspirador do devocional",
  "excerpt": "Um resumo de 1-2 frases do conteúdo", 
  "content": "O conteúdo completo do devocional com 3-4 parágrafos bem desenvolvidos. Inclua reflexões bíblicas, aplicações práticas e uma conclusão edificante.",
  "imagePrompt": "Uma descrição em inglês de uma imagem artística e inspiradora que represente visualmente o tema do devocional. Deve ser uma cena pacífica, espiritual, com elementos bíblicos ou natureza. Exemplo: serene sunset over calm waters with a cross silhouette"
}`;

    console.log("Calling Lovable AI to generate devotional...");
    
    // Generate text content
    const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    if (!textResponse.ok) {
      if (textResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido, tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (textResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes para geração de conteúdo." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await textResponse.text();
      console.error("AI gateway error:", textResponse.status, errorText);
      throw new Error(`AI gateway error: ${textResponse.status}`);
    }

    const textData = await textResponse.json();
    const generatedContent = textData.choices?.[0]?.message?.content;
    
    console.log("Generated content:", generatedContent);

    // Try to parse as JSON
    let result: { title: string; excerpt: string; content: string; imagePrompt?: string; imageUrl?: string };
    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse JSON, creating structured response:", parseError);
      result = {
        title: "Reflexão do Dia",
        excerpt: generatedContent.substring(0, 150) + "...",
        content: generatedContent,
        imagePrompt: "peaceful sunrise over mountains with rays of light, spiritual christian art, hope and faith"
      };
    }

    // Generate image based on the content
    const imagePrompt = result.imagePrompt || `Christian devotional art, ${topic || 'spiritual reflection'}, peaceful, inspirational, soft lighting, artistic`;
    
    console.log("Generating image with prompt:", imagePrompt);
    
    try {
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: `Generate a beautiful, artistic image for a Christian devotional blog post. The image should be: ${imagePrompt}. Style: peaceful, spiritual, high quality, suitable for a religious blog. Ultra high resolution.`
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        console.log("Image generation response received");
        
        // Extract the image URL from the response
        const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (imageUrl) {
          result.imageUrl = imageUrl;
          console.log("Image generated successfully");
        } else {
          console.log("No image URL in response");
        }
      } else {
        console.error("Image generation failed:", imageResponse.status);
      }
    } catch (imageError) {
      console.error("Error generating image:", imageError);
      // Continue without image - don't fail the whole request
    }

    // Remove imagePrompt from result as we don't need to send it to the client
    delete result.imagePrompt;

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
