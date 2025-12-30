import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AcademicRecord {
  id: string;
  user_id: string;
  course_id: string;
  grade: number | null;
  status: string;
  started_at: string;
  completed_at: string | null;
  certificate_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useMyAcademicRecords() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["my-academic-records", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academic_records")
        .select("*")
        .eq("user_id", user?.id)
        .order("started_at", { ascending: false });
      
      if (error) throw error;
      return data as AcademicRecord[];
    },
    enabled: !!user?.id,
  });
}

export function useAllAcademicRecords() {
  return useQuery({
    queryKey: ["all-academic-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academic_records")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as AcademicRecord[];
    },
  });
}

export function useCreateAcademicRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (record: Omit<AcademicRecord, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("academic_records")
        .insert(record)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-academic-records"] });
      queryClient.invalidateQueries({ queryKey: ["my-academic-records"] });
    },
  });
}

export function useUpdateAcademicRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AcademicRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from("academic_records")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-academic-records"] });
      queryClient.invalidateQueries({ queryKey: ["my-academic-records"] });
    },
  });
}
