import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdmissionLead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  interest_course: string | null;
  how_found_us: string | null;
  status: string;
  notes: string | null;
  assigned_to: string | null;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAdmissionLeads() {
  return useQuery({
    queryKey: ["admission-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admission_leads")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as AdmissionLead[];
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lead: Omit<AdmissionLead, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("admission_leads")
        .insert(lead)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admission-leads"] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdmissionLead> & { id: string }) => {
      const { data, error } = await supabase
        .from("admission_leads")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admission-leads"] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("admission_leads")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admission-leads"] });
    },
  });
}
