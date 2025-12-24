import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string | null;
  course_id: string | null;
  created_by: string | null;
  is_public: boolean;
  created_at: string;
}

export function useCalendarEvents(month?: Date) {
  return useQuery({
    queryKey: ["calendar-events", month?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from("calendar_events")
        .select("*")
        .eq("is_public", true);

      if (month) {
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);
        
        query = query
          .gte("start_time", startOfMonth.toISOString())
          .lte("start_time", endOfMonth.toISOString());
      }

      const { data, error } = await query.order("start_time", { ascending: true });
      if (error) throw error;
      return data as CalendarEvent[];
    },
  });
}

export function useUpcomingEvents(limit = 5) {
  return useQuery({
    queryKey: ["upcoming-events", limit],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("is_public", true)
        .gte("start_time", now)
        .order("start_time", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });
}

export function useCreateEvent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Omit<CalendarEvent, "id" | "created_at" | "created_by">) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          ...event,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
    },
  });
}
