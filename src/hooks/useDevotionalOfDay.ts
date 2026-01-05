import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DailyDevotional {
  id: string;
  title: string;
  verse_reference: string;
  verse_text: string;
  reflection: string;
  prayer: string | null;
  publish_date: string;
}

// Lista de versículos para fallback quando não há devocional do dia
const fallbackVerses = [
  { text: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.", ref: "Salmos 119:105" },
  { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.", ref: "João 3:16" },
  { text: "O Senhor é o meu pastor; nada me faltará.", ref: "Salmos 23:1" },
  { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { text: "Confia no Senhor de todo o teu coração.", ref: "Provérbios 3:5" },
  { text: "Busquem, pois, em primeiro lugar o Reino de Deus.", ref: "Mateus 6:33" },
  { text: "Eu sou o caminho, a verdade e a vida.", ref: "João 14:6" },
  { text: "Alegrai-vos sempre no Senhor.", ref: "Filipenses 4:4" },
  { text: "O Senhor é a minha luz e a minha salvação.", ref: "Salmos 27:1" },
  { text: "Porque onde estiver o vosso tesouro, aí estará também o vosso coração.", ref: "Mateus 6:21" },
  { text: "Vinde a mim, todos os que estais cansados e oprimidos.", ref: "Mateus 11:28" },
  { text: "Não temas, porque eu sou contigo.", ref: "Isaías 41:10" },
  { text: "A fé vem pelo ouvir, e o ouvir pela palavra de Deus.", ref: "Romanos 10:17" },
  { text: "O amor é paciente, o amor é bondoso.", ref: "1 Coríntios 13:4" },
  { text: "Sede fortes e corajosos.", ref: "Josué 1:9" },
  { text: "O Senhor é bom, fortaleza no dia da angústia.", ref: "Naum 1:7" },
  { text: "Entrega o teu caminho ao Senhor.", ref: "Salmos 37:5" },
  { text: "Graças a Deus que nos dá a vitória.", ref: "1 Coríntios 15:57" },
  { text: "Eis que estou à porta e bato.", ref: "Apocalipse 3:20" },
  { text: "Porque o Senhor dá a sabedoria.", ref: "Provérbios 2:6" },
  { text: "Antes de te formar no ventre, eu te conheci.", ref: "Jeremias 1:5" },
  { text: "A paz vos deixo, a minha paz vos dou.", ref: "João 14:27" },
  { text: "Pois nada me envergonho do evangelho.", ref: "Romanos 1:16" },
  { text: "O Senhor é a minha rocha e o meu refúgio.", ref: "Salmos 18:2" },
  { text: "Todas as coisas cooperam para o bem.", ref: "Romanos 8:28" },
  { text: "Orai sem cessar.", ref: "1 Tessalonicenses 5:17" },
  { text: "O fruto do Espírito é amor, alegria, paz.", ref: "Gálatas 5:22" },
  { text: "Crê no Senhor Jesus Cristo e serás salvo.", ref: "Atos 16:31" },
  { text: "Bendize, ó minha alma, ao Senhor.", ref: "Salmos 103:1" },
  { text: "A misericórdia do Senhor dura para sempre.", ref: "Salmos 136:1" },
  { text: "Eu sou a ressurreição e a vida.", ref: "João 11:25" },
];

export const getDailyVerse = () => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return fallbackVerses[dayOfYear % fallbackVerses.length];
};

export const useDevotionalOfDay = () => {
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['devotional-of-day', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('publish_date', today)
        .maybeSingle();

      if (error) throw error;
      return data as DailyDevotional | null;
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
};
