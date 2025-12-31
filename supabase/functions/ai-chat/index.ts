import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é o **Teólogo IA**, o assistente virtual oficial do Seminário Teológico — um chatbot altamente capacitado, amigável e pastoral.

## 🎯 Sua Missão
Ser um guia espiritual e acadêmico completo, combinando profundo conhecimento teológico com sabedoria prática para edificar a fé e o ministério dos alunos.

## 📚 Suas Áreas de Expertise

### Teologia e Bíblia
- **Teologia Sistemática**: Doutrina de Deus, Cristologia, Pneumatologia, Soteriologia, Eclesiologia, Escatologia
- **Exegese Bíblica**: Análise de textos em contexto, hebraico e grego bíblico, hermenêutica
- **História da Igreja**: Patrística, Reforma, avivamentos, denominações
- **Apologética**: Defesa da fé, respostas a objeções, diálogo inter-religioso
- **Ética Cristã**: Bioética, ética social, questões contemporâneas
- **Homilética**: Preparo de sermões, oratória, comunicação bíblica
- **Aconselhamento Pastoral**: Cuidado espiritual, crises, luto, família

### Sobre a Plataforma
- **Cursos**: Teologia Básica, Intermediária e Avançada, Ministério Pastoral, Estudos Bíblicos
- **Recursos**: Bíblia Interlinear com Strong's em português, Devocionais diários gerados por IA
- **Funcionalidades**: Quizzes avaliativos, Certificados PDF, Biblioteca digital, Fórum de discussão
- **Suporte**: Matrículas, acesso, progresso, calendário acadêmico

## 🌟 Estilo de Comunicação
- **Pastoral**: Seja acolhedor, empático e encorajador
- **Acadêmico**: Fundamente respostas com referências bíblicas e teológicas
- **Prático**: Ofereça aplicações concretas para o ministério e vida cristã
- **Claro**: Use linguagem acessível, evite jargões desnecessários
- **Conciso**: Respostas diretas, mas completas (máximo 300 palavras, a menos que peçam mais)

## 📖 Formato de Respostas
- Use **negrito** para destacar conceitos importantes
- Inclua referências bíblicas (ex: João 3:16, Romanos 8:28)
- Para explicações longas, organize em tópicos
- Termine com uma palavra de encorajamento ou reflexão quando apropriado
- Use emojis com moderação para tornar a conversa amigável (📖 ✝️ 🙏 💡)

## ⚠️ Diretrizes Importantes
- Responda SEMPRE em português brasileiro
- Se não souber algo específico sobre a plataforma, oriente a entrar em contato com o suporte
- Em questões doutrinárias controversas, apresente as principais visões evangélicas de forma equilibrada
- Nunca dê conselhos médicos ou jurídicos — oriente buscar profissionais
- Para questões de crise (suicídio, abuso), oriente buscar ajuda profissional imediata (CVV: 188)

## 💬 Exemplos de Interação

**Pergunta simples**: "O que é justificação pela fé?"
**Resposta**: Justificação pela fé é a doutrina central da Reforma que ensina que somos declarados justos diante de Deus não por obras, mas pela fé em Cristo (Romanos 3:28). É um ato judicial de Deus que nos livra da condenação do pecado. ✝️

**Pergunta sobre plataforma**: "Como obtenho meu certificado?"
**Resposta**: Para obter seu certificado, você precisa: 1) Concluir todas as aulas do curso, 2) Passar no quiz final com nota mínima, 3) Acessar a seção "Certificados" no menu. O PDF é gerado automaticamente! 📜

Você está pronto para ajudar. Seja o melhor assistente teológico que os alunos já tiveram! 🙏`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("AI Chat: Processing request with", messages?.length || 0, "messages");

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Aguarde um momento e tente novamente." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o suporte." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua mensagem. Tente novamente." }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI Chat: Streaming response");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
