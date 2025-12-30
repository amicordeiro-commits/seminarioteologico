import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DevotionalInteraction {
  id: string;
  user_id: string;
  devotional_id: string;
  is_liked: boolean;
  is_bookmarked: boolean;
}

export function useDevotionalInteraction(devotionalId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: interaction, isLoading } = useQuery({
    queryKey: ["devotionalInteraction", devotionalId, user?.id],
    queryFn: async () => {
      if (!user?.id || !devotionalId) return null;

      const { data, error } = await supabase
        .from("devotional_interactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("devotional_id", devotionalId)
        .maybeSingle();

      if (error) throw error;
      return data as DevotionalInteraction | null;
    },
    enabled: !!user?.id && !!devotionalId,
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !devotionalId) throw new Error("Missing data");

      const newLikeStatus = !interaction?.is_liked;

      const { data, error } = await supabase
        .from("devotional_interactions")
        .upsert({
          user_id: user.id,
          devotional_id: devotionalId,
          is_liked: newLikeStatus,
          is_bookmarked: interaction?.is_bookmarked || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotionalInteraction", devotionalId] });
    },
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !devotionalId) throw new Error("Missing data");

      const newBookmarkStatus = !interaction?.is_bookmarked;

      const { data, error } = await supabase
        .from("devotional_interactions")
        .upsert({
          user_id: user.id,
          devotional_id: devotionalId,
          is_liked: interaction?.is_liked || false,
          is_bookmarked: newBookmarkStatus,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotionalInteraction", devotionalId] });
    },
  });

  return {
    interaction,
    isLoading,
    isLiked: interaction?.is_liked || false,
    isBookmarked: interaction?.is_bookmarked || false,
    toggleLike: toggleLikeMutation.mutateAsync,
    toggleBookmark: toggleBookmarkMutation.mutateAsync,
    isTogglingLike: toggleLikeMutation.isPending,
    isTogglingBookmark: toggleBookmarkMutation.isPending,
  };
}
