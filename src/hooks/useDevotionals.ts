import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Devotional {
  id: string;
  title: string;
  verse_reference: string;
  verse_text: string;
  reflection: string;
  prayer: string | null;
  publish_date: string;
  created_at: string;
}

export interface DevotionalNote {
  id: string;
  user_id: string;
  devotional_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch today's devotional
export const useTodayDevotional = () => {
  return useQuery({
    queryKey: ['devotional', 'today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('publish_date', today)
        .maybeSingle();
      
      if (error) throw error;
      return data as Devotional | null;
    },
  });
};

// Fetch devotional by date
export const useDevotionalByDate = (date: string) => {
  return useQuery({
    queryKey: ['devotional', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('publish_date', date)
        .maybeSingle();
      
      if (error) throw error;
      return data as Devotional | null;
    },
    enabled: !!date,
  });
};

// Fetch user's devotional notes
export const useDevotionalNote = (devotionalId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['devotional-note', devotionalId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('devotional_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('devotional_id', devotionalId)
        .maybeSingle();
      
      if (error) throw error;
      return data as DevotionalNote | null;
    },
    enabled: !!user && !!devotionalId,
  });
};

// Save devotional note
export const useSaveDevotionalNote = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ devotionalId, notes }: { devotionalId: string; notes: string }) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('devotional_notes')
        .upsert({
          user_id: user.id,
          devotional_id: devotionalId,
          notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devotional-note', variables.devotionalId] });
    },
  });
};
