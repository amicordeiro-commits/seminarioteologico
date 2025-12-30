import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  description: string | null;
}

interface GeneratedQuestion {
  question_text: string;
  options: { text: string; is_correct: boolean }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseId, courseName, lessonId, lessonName, numberOfQuestions = 10, passingScore = 70 } = await req.json();

    if (!courseId) {
      return new Response(
        JSON.stringify({ error: "courseId é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let lessonsContent: string;
    let quizTitle: string;
    let quizDescription: string;

    if (lessonId) {
      // Generate quiz for a specific lesson
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("id, title, content, description")
        .eq("id", lessonId)
        .single();

      if (lessonError || !lesson) {
        return new Response(
          JSON.stringify({ error: "Aula não encontrada" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const content = lesson.content?.replace(/<[^>]*>/g, ' ') || '';
      const description = lesson.description || '';
      lessonsContent = `Aula: ${lesson.title}\n${description}\n${content}`;
      quizTitle = `Avaliação - ${lessonName || lesson.title}`;
      quizDescription = `Avaliação gerada automaticamente baseada na aula "${lesson.title}".`;
      
      console.log(`Gerando quiz com ${numberOfQuestions} questões para aula: ${lesson.title}`);
    } else {
      // Generate quiz for entire course
      const { data: lessons, error: lessonsError } = await supabase
        .from("lessons")
        .select("id, title, content, description")
        .eq("course_id", courseId)
        .order("order_index");

      if (lessonsError) {
        throw new Error(`Erro ao buscar aulas: ${lessonsError.message}`);
      }

      if (!lessons || lessons.length === 0) {
        return new Response(
          JSON.stringify({ error: "Nenhuma aula encontrada para este curso" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      lessonsContent = lessons.map((lesson: Lesson, idx: number) => {
        const content = lesson.content?.replace(/<[^>]*>/g, ' ').substring(0, 2000) || '';
        const description = lesson.description || '';
        return `Aula ${idx + 1}: ${lesson.title}\n${description}\n${content}`;
      }).join('\n\n---\n\n');
      
      quizTitle = `Avaliação Final - ${courseName}`;
      quizDescription = `Avaliação gerada automaticamente com ${numberOfQuestions} questões baseadas no conteúdo do curso.`;
      
      console.log(`Gerando quiz com ${numberOfQuestions} questões para curso: ${courseName}`);
    }

    // Call Lovable AI to generate questions
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `Você é um professor especialista em teologia e educação cristã. Sua tarefa é criar questões de múltipla escolha para avaliar o conhecimento dos alunos.

REGRAS IMPORTANTES:
1. Crie exatamente ${numberOfQuestions} questões
2. Cada questão deve ter 4 alternativas (A, B, C, D)
3. Apenas UMA alternativa deve ser correta
4. As questões devem cobrir diferentes tópicos das aulas
5. Varie a dificuldade: 30% fáceis, 50% médias, 20% difíceis
6. As alternativas incorretas devem ser plausíveis, não óbvias
7. Use linguagem clara e objetiva em português brasileiro`
          },
          {
            role: "user",
            content: `Baseado no conteúdo das aulas abaixo do curso "${courseName}", crie ${numberOfQuestions} questões de múltipla escolha.

CONTEÚDO DAS AULAS:
${lessonsContent}

Retorne APENAS um JSON válido no seguinte formato (sem markdown, sem explicações):
{
  "questions": [
    {
      "question_text": "Pergunta aqui?",
      "options": [
        {"text": "Alternativa A", "is_correct": false},
        {"text": "Alternativa B", "is_correct": true},
        {"text": "Alternativa C", "is_correct": false},
        {"text": "Alternativa D", "is_correct": false}
      ]
    }
  ]
}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI Error:", errorText);
      throw new Error("Erro ao gerar questões com IA");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse the AI response
    let generatedQuestions: GeneratedQuestion[];
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedContent = aiContent.trim();
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent.slice(7);
      } else if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith("```")) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      
      const parsed = JSON.parse(cleanedContent.trim());
      generatedQuestions = parsed.questions;
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", aiContent);
      throw new Error("Erro ao processar resposta da IA. Tente novamente.");
    }

    if (!generatedQuestions || generatedQuestions.length === 0) {
      throw new Error("Nenhuma questão foi gerada");
    }

    // Create the quiz in the database
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        course_id: courseId,
        lesson_id: lessonId || null,
        title: quizTitle,
        description: quizDescription,
        passing_score: passingScore,
        time_limit_minutes: Math.ceil(numberOfQuestions * 3),
        is_published: false,
      })
      .select()
      .single();

    if (quizError) {
      console.error("Quiz creation error:", quizError);
      throw new Error(`Erro ao criar quiz: ${quizError.message}`);
    }

    // Insert questions and options
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      
      const { data: question, error: questionError } = await supabase
        .from("quiz_questions")
        .insert({
          quiz_id: quiz.id,
          question_text: q.question_text,
          question_type: "multiple_choice",
          points: 1,
          order_index: i,
        })
        .select()
        .single();

      if (questionError) {
        console.error("Question creation error:", questionError);
        continue;
      }

      // Insert options
      const optionsToInsert = q.options.map((opt, idx) => ({
        question_id: question.id,
        option_text: opt.text,
        is_correct: opt.is_correct,
        order_index: idx,
      }));

      const { error: optionsError } = await supabase
        .from("quiz_options")
        .insert(optionsToInsert);

      if (optionsError) {
        console.error("Options creation error:", optionsError);
      }
    }

    console.log(`Quiz criado com sucesso: ${quiz.id} com ${generatedQuestions.length} questões`);

    return new Response(
      JSON.stringify({
        success: true,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          questionsCount: generatedQuestions.length,
          passingScore: passingScore,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating quiz:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
