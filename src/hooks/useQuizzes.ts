import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Quiz {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit_minutes: number | null;
  is_published: boolean;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  points: number;
  order_index: number;
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number | null;
  passed: boolean | null;
  started_at: string;
  completed_at: string | null;
  answers: any;
}

export function useQuizzes(courseId?: string) {
  return useQuery({
    queryKey: ["quizzes", courseId],
    queryFn: async () => {
      let query = supabase
        .from("quizzes")
        .select("*")
        .eq("is_published", true);

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query.order("created_at", { ascending: true });
      if (error) throw error;
      return data as Quiz[];
    },
  });
}

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (error) throw error;
      return data as Quiz;
    },
    enabled: !!quizId,
  });
}

export function useQuizQuestions(quizId: string) {
  return useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const { data: questions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index", { ascending: true });

      if (questionsError) throw questionsError;

      // Fetch options for all questions
      const questionIds = questions.map((q: any) => q.id);
      const { data: options, error: optionsError } = await supabase
        .from("quiz_options")
        .select("*")
        .in("question_id", questionIds)
        .order("order_index", { ascending: true });

      if (optionsError) throw optionsError;

      // Map options to questions
      const questionsWithOptions = questions.map((q: any) => ({
        ...q,
        options: options.filter((o: any) => o.question_id === q.id),
      }));

      return questionsWithOptions as (QuizQuestion & { options: QuizOption[] })[];
    },
    enabled: !!quizId,
  });
}

export function useQuizAttempts(quizId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["quiz-attempts", quizId, user?.id],
    queryFn: async () => {
      let query = supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user!.id);

      if (quizId) {
        query = query.eq("quiz_id", quizId);
      }

      const { data, error } = await query.order("started_at", { ascending: false });
      if (error) throw error;
      return data as QuizAttempt[];
    },
    enabled: !!user?.id,
  });
}

export function useSubmitQuiz() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      answers,
      score,
      passed,
    }: {
      quizId: string;
      answers: Record<string, string>;
      score: number;
      passed: boolean;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: quizId,
          user_id: user.id,
          answers,
          score,
          passed,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts", variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
    },
  });
}
