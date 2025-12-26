import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface BibleNote {
  id: string;
  user_id: string;
  verse_id: string;
  book_abbrev: string;
  chapter: number;
  verse: number;
  note: string;
  created_at: string;
  updated_at: string;
}

export function useBibleNotes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['bible-notes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bible_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as BibleNote[];
    },
    enabled: !!user,
  });

  const saveNote = useMutation({
    mutationFn: async (noteData: {
      verse_id: string;
      book_abbrev: string;
      chapter: number;
      verse: number;
      note: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Check if note exists
      const existing = notes.find(n => n.verse_id === noteData.verse_id);
      
      if (existing) {
        const { error } = await supabase
          .from('bible_notes')
          .update({ note: noteData.note })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('bible_notes').insert({
          user_id: user.id,
          ...noteData,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-notes'] });
      toast.success('Nota salva');
    },
    onError: () => {
      toast.error('Erro ao salvar nota');
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (verseId: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      const { error } = await supabase
        .from('bible_notes')
        .delete()
        .eq('user_id', user.id)
        .eq('verse_id', verseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-notes'] });
      toast.success('Nota removida');
    },
    onError: () => {
      toast.error('Erro ao remover nota');
    },
  });

  const getNoteForVerse = (verseId: string): BibleNote | undefined => {
    return notes.find(n => n.verse_id === verseId);
  };

  return {
    notes,
    isLoading,
    saveNote: saveNote.mutate,
    deleteNote: deleteNote.mutate,
    getNoteForVerse,
  };
}
