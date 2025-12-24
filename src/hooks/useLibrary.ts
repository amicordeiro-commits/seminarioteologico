import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LibraryMaterial {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  course_id: string | null;
  category: string;
  is_published: boolean;
  download_count: number;
  created_at: string;
}

export function useLibraryMaterials(category?: string) {
  return useQuery({
    queryKey: ["library-materials", category],
    queryFn: async () => {
      let query = supabase
        .from("library_materials")
        .select("*")
        .eq("is_published", true);

      if (category && category !== "Todos") {
        query = query.eq("category", category);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as LibraryMaterial[];
    },
  });
}

export function useLibraryCategories() {
  return useQuery({
    queryKey: ["library-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_materials")
        .select("category")
        .eq("is_published", true);

      if (error) throw error;

      const categories = [...new Set(data.map((item: any) => item.category))];
      return ["Todos", ...categories.filter(Boolean)];
    },
  });
}
