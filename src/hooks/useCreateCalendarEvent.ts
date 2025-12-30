import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CreateEventInput {
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  event_type?: string;
  is_public?: boolean;
  course_id?: string;
}

export function useCreateCalendarEvent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createEventMutation = useMutation({
    mutationFn: async (input: CreateEventInput) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          ...input,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingEvents"] });
    },
  });

  return {
    createEvent: createEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
  };
}
