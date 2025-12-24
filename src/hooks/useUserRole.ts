import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "instructor" | "student";

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export function useUserRole() {
  const { user } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!user?.id,
  });

  const isAdmin = roles.some((r) => r.role === "admin");
  const isInstructor = roles.some((r) => r.role === "instructor");
  const isStudent = roles.some((r) => r.role === "student") || roles.length === 0;

  const hasRole = (role: AppRole) => roles.some((r) => r.role === role);

  return {
    roles,
    isLoading,
    isAdmin,
    isInstructor,
    isStudent,
    hasRole,
  };
}
