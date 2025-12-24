import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  pdf_url: string | null;
  course?: {
    title: string;
    instructor: string;
    duration_hours: number;
  };
}

export function useCertificates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["certificates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          courses (
            title,
            instructor,
            duration_hours
          )
        `)
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!user?.id,
  });
}

export function useGenerateCertificate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Generate a unique certificate number
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { data, error } = await supabase
        .from("certificates")
        .insert({
          user_id: user.id,
          course_id: courseId,
          certificate_number: certificateNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
}
