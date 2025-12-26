import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface BibleBookmark {
  id: string;
  user_id: string;
  verse_id: string;
  book_abbrev: string;
  chapter: number;
  verse: number;
  verse_text: string | null;
  created_at: string;
}

export function useBibleBookmarks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['bible-bookmarks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bible_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BibleBookmark[];
    },
    enabled: !!user,
  });

  const addBookmark = useMutation({
    mutationFn: async (bookmark: {
      verse_id: string;
      book_abbrev: string;
      chapter: number;
      verse: number;
      verse_text?: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');
      const { error } = await supabase.from('bible_bookmarks').insert({
        user_id: user.id,
        ...bookmark,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-bookmarks'] });
      toast.success('Versículo adicionado aos favoritos');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast.info('Versículo já está nos favoritos');
      } else {
        toast.error('Erro ao adicionar favorito');
      }
    },
  });

  const removeBookmark = useMutation({
    mutationFn: async (verseId: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      const { error } = await supabase
        .from('bible_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('verse_id', verseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-bookmarks'] });
      toast.success('Favorito removido');
    },
    onError: () => {
      toast.error('Erro ao remover favorito');
    },
  });

  const isBookmarked = (verseId: string) => {
    return bookmarks.some(b => b.verse_id === verseId);
  };

  const toggleBookmark = (bookmark: {
    verse_id: string;
    book_abbrev: string;
    chapter: number;
    verse: number;
    verse_text?: string;
  }) => {
    if (isBookmarked(bookmark.verse_id)) {
      removeBookmark.mutate(bookmark.verse_id);
    } else {
      addBookmark.mutate(bookmark);
    }
  };

  return {
    bookmarks,
    isLoading,
    addBookmark: addBookmark.mutate,
    removeBookmark: removeBookmark.mutate,
    isBookmarked,
    toggleBookmark,
  };
}
