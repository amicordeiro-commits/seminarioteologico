import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  new_course_notifications: boolean;
  message_notifications: boolean;
  reminder_notifications: boolean;
  weekly_digest: boolean;
  theme: string;
  font_size: string;
  language: string;
  timezone: string;
}

export function useUserSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["userSettings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no settings exist, create default ones
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from("user_settings")
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newSettings as UserSettings;
      }
      
      return data as UserSettings;
    },
    enabled: !!user?.id,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_settings")
        .upsert({ user_id: user.id, ...updates })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings", user?.id] });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,
  };
}
