import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  const { data: enrollmentStats } = useQuery({
    queryKey: ["enrollmentStats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select("*, courses(*)")
        .eq("user_id", user.id);

      if (error) throw error;

      const completed = enrollments.filter(e => e.completed_at !== null).length;
      const inProgress = enrollments.filter(e => e.completed_at === null).length;
      
      const totalHours = enrollments.reduce((acc, e) => {
        const course = e.courses as any;
        return acc + (course?.duration_hours || 0);
      }, 0);

      return {
        coursesCompleted: completed,
        coursesInProgress: inProgress,
        totalHours,
        certificates: completed,
      };
    },
    enabled: !!user?.id,
  });

  return {
    profile,
    isLoading,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    stats: enrollmentStats || {
      coursesCompleted: 0,
      coursesInProgress: 0,
      totalHours: 0,
      certificates: 0,
    },
  };
}
