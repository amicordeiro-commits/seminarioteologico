import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface FinancialTransaction {
  id: string;
  user_id: string;
  course_id: string | null;
  plan_id: string | null;
  amount: number;
  type: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  reference: string | null;
  description: string | null;
  created_at: string;
}

export interface CoursePlan {
  id: string;
  course_id: string | null;
  name: string;
  description: string | null;
  price: number;
  installments: number;
  is_active: boolean;
  created_at: string;
}

export interface Donation {
  id: string;
  donor_name: string;
  donor_email: string | null;
  donor_phone: string | null;
  amount: number;
  is_recurring: boolean;
  recurrence_type: string | null;
  status: string;
  payment_method: string | null;
  message: string | null;
  is_anonymous: boolean;
  created_at: string;
}

export function useMyTransactions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["my-transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("due_date", { ascending: false });
      
      if (error) throw error;
      return data as FinancialTransaction[];
    },
    enabled: !!user?.id,
  });
}

export function useAllTransactions() {
  return useQuery({
    queryKey: ["all-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as FinancialTransaction[];
    },
  });
}

export function useCoursePlans() {
  return useQuery({
    queryKey: ["course-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_plans")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as CoursePlan[];
    },
  });
}

export function useDonations() {
  return useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Donation[];
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: Omit<FinancialTransaction, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .insert(transaction)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["my-transactions"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FinancialTransaction> & { id: string }) => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["my-transactions"] });
    },
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (donation: Omit<Donation, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("donations")
        .insert(donation)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
  });
}
