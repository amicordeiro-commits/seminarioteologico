import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format, differenceInDays, parseISO } from "date-fns";

export interface DevotionalStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_read_date: string | null;
}

export function useDevotionalStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: streak, isLoading } = useQuery({
    queryKey: ["devotionalStreak", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("devotional_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no streak exists, create one
      if (!data) {
        const { data: newStreak, error: insertError } = await supabase
          .from("devotional_streaks")
          .insert({ user_id: user.id, current_streak: 0, longest_streak: 0 })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newStreak as DevotionalStreak;
      }
      
      return data as DevotionalStreak;
    },
    enabled: !!user?.id,
  });

  const recordReadingMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const today = format(new Date(), "yyyy-MM-dd");
      
      // Get current streak
      const { data: currentStreak } = await supabase
        .from("devotional_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      let newCurrentStreak = 1;
      let newLongestStreak = 1;

      if (currentStreak) {
        // If already read today, don't update
        if (currentStreak.last_read_date === today) {
          return currentStreak;
        }

        const lastRead = currentStreak.last_read_date 
          ? parseISO(currentStreak.last_read_date) 
          : null;
        
        if (lastRead) {
          const daysDiff = differenceInDays(new Date(), lastRead);
          
          if (daysDiff === 1) {
            // Consecutive day - increment streak
            newCurrentStreak = (currentStreak.current_streak || 0) + 1;
          } else if (daysDiff > 1) {
            // Streak broken - reset to 1
            newCurrentStreak = 1;
          }
        }
        
        newLongestStreak = Math.max(newCurrentStreak, currentStreak.longest_streak || 0);
      }

      const { data, error } = await supabase
        .from("devotional_streaks")
        .upsert({
          user_id: user.id,
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_read_date: today,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotionalStreak", user?.id] });
    },
  });

  return {
    streak,
    currentStreak: streak?.current_streak || 0,
    longestStreak: streak?.longest_streak || 0,
    lastReadDate: streak?.last_read_date,
    isLoading,
    recordReading: recordReadingMutation.mutateAsync,
    isRecording: recordReadingMutation.isPending,
  };
}
