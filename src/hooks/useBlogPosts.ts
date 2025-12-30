import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  author_id: string | null;
  author_name: string | null;
  featured_image: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useBlogPosts(onlyPublished = true) {
  return useQuery({
    queryKey: ["blog-posts", onlyPublished],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (onlyPublished) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: ["blog-post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!id,
  });
}

export function useRecentBlogPosts(limit = 3) {
  return useQuery({
    queryKey: ["blog-posts-recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (post: {
      title: string;
      content: string;
      excerpt?: string;
      author_name?: string;
      featured_image?: string;
      is_published?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          ...post,
          author_id: user?.id,
          published_at: post.is_published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts-recent"] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<BlogPost> & { id: string }) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .update({
          ...updates,
          published_at: updates.is_published ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts-recent"] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts-recent"] });
    },
  });
}

export function useGenerateDevotional() {
  return useMutation({
    mutationFn: async (params: { topic?: string; bibleReference?: string }) => {
      const { data, error } = await supabase.functions.invoke(
        "generate-devotional",
        {
          body: params,
        }
      );

      if (error) throw error;
      return data as { title: string; excerpt: string; content: string; imageUrl?: string };
    },
  });
}
