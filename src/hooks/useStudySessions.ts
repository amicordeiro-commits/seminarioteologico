import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { startOfWeek, endOfWeek, format, eachDayOfInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface StudySession {
  id: string;
  user_id: string;
  lesson_id: string | null;
  course_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  session_date: string;
}

export interface WeeklyStudyData {
  day: string;
  hours: number;
  date: string;
}

export function useStudySessions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get weekly study data
  const { data: weeklyData = [], isLoading } = useQuery({
    queryKey: ["studySessions", "weekly", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .gte("session_date", format(weekStart, "yyyy-MM-dd"))
        .lte("session_date", format(weekEnd, "yyyy-MM-dd"));

      if (error) throw error;

      // Aggregate by day
      const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      const weeklyData: WeeklyStudyData[] = daysOfWeek.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const daySessions = (data || []).filter((s) => s.session_date === dateStr);
        const totalSeconds = daySessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
        
        return {
          day: format(day, "EEE", { locale: ptBR }).charAt(0).toUpperCase() + format(day, "EEE", { locale: ptBR }).slice(1, 3),
          hours: Math.round((totalSeconds / 3600) * 10) / 10, // Round to 1 decimal
          date: dateStr,
        };
      });

      return weeklyData;
    },
    enabled: !!user?.id,
  });

  // Start a new study session
  const startSessionMutation = useMutation({
    mutationFn: async ({ lessonId, courseId }: { lessonId?: string; courseId?: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: user.id,
          lesson_id: lessonId || null,
          course_id: courseId || null,
          started_at: new Date().toISOString(),
          session_date: format(new Date(), "yyyy-MM-dd"),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  // End a study session
  const endSessionMutation = useMutation({
    mutationFn: async ({ sessionId, durationSeconds }: { sessionId: string; durationSeconds: number }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("study_sessions")
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studySessions"] });
    },
  });

  // Calculate total weekly hours
  const totalHoursWeek = weeklyData.reduce((acc, d) => acc + d.hours, 0);

  return {
    weeklyData,
    totalHoursWeek,
    isLoading,
    startSession: startSessionMutation.mutateAsync,
    endSession: endSessionMutation.mutateAsync,
  };
}
