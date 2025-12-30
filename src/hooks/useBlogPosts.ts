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

// Helper function to upload base64 image to storage
async function uploadImageToStorage(base64Image: string, postId: string): Promise<string> {
  // If it's not a base64 image, return as is
  if (!base64Image.startsWith("data:")) {
    return base64Image;
  }

  // Extract the base64 data and mime type
  const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    console.error("Invalid base64 format");
    return base64Image;
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const extension = mimeType.split("/")[1] || "png";

  // Convert base64 to Blob
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  // Upload to storage
  const fileName = `${postId}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("blog-images")
    .upload(fileName, blob, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("blog-images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
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
      // First create the post to get the ID
      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          author_name: post.author_name,
          author_id: user?.id,
          is_published: post.is_published,
          published_at: post.is_published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      // If there's a featured image, upload it to storage
      if (post.featured_image && post.featured_image.startsWith("data:")) {
        try {
          const imageUrl = await uploadImageToStorage(post.featured_image, data.id);
          
          // Update the post with the storage URL
          const { error: updateError } = await supabase
            .from("blog_posts")
            .update({ featured_image: imageUrl })
            .eq("id", data.id);

          if (updateError) {
            console.error("Error updating image URL:", updateError);
          } else {
            data.featured_image = imageUrl;
          }
        } catch (uploadErr) {
          console.error("Error uploading image:", uploadErr);
          // Continue without the image URL update
        }
      }

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
      // If there's a new base64 image, upload it first
      let finalImageUrl = updates.featured_image;
      if (updates.featured_image && updates.featured_image.startsWith("data:")) {
        try {
          finalImageUrl = await uploadImageToStorage(updates.featured_image, id);
        } catch (uploadErr) {
          console.error("Error uploading image:", uploadErr);
          // Keep the original if upload fails
        }
      }

      const { data, error } = await supabase
        .from("blog_posts")
        .update({
          ...updates,
          featured_image: finalImageUrl,
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
      // Also delete the image from storage
      const extensions = ["png", "jpg", "jpeg", "webp", "gif"];
      for (const ext of extensions) {
        await supabase.storage
          .from("blog-images")
          .remove([`${id}.${ext}`]);
      }
      
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
