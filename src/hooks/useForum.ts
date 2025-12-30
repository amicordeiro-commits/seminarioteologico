import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ForumTopic {
  id: string;
  course_id: string | null;
  lesson_id: string | null;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  last_reply_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
}

export function useForumTopics(courseId?: string) {
  return useQuery({
    queryKey: ["forum-topics", courseId],
    queryFn: async () => {
      let query = supabase
        .from("forum_topics")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("last_reply_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      
      if (courseId) {
        query = query.eq("course_id", courseId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ForumTopic[];
    },
  });
}

export function useForumTopic(topicId: string) {
  return useQuery({
    queryKey: ["forum-topic", topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_topics")
        .select("*")
        .eq("id", topicId)
        .maybeSingle();
      
      if (error) throw error;
      return data as ForumTopic | null;
    },
    enabled: !!topicId,
  });
}

export function useForumReplies(topicId: string) {
  return useQuery({
    queryKey: ["forum-replies", topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as ForumReply[];
    },
    enabled: !!topicId,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (topic: { title: string; content: string; course_id?: string; lesson_id?: string }) => {
      const { data, error } = await supabase
        .from("forum_topics")
        .insert({
          ...topic,
          user_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-topics"] });
    },
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ topicId, content }: { topicId: string; content: string }) => {
      const { data, error } = await supabase
        .from("forum_replies")
        .insert({
          topic_id: topicId,
          user_id: user?.id,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update topic last_reply_at
      await supabase
        .from("forum_topics")
        .update({
          last_reply_at: new Date().toISOString(),
        })
        .eq("id", topicId);
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies", variables.topicId] });
      queryClient.invalidateQueries({ queryKey: ["forum-topics"] });
    },
  });
}
