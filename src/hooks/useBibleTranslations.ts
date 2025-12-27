import { useState, useCallback, useMemo } from 'react';
import { getBookName, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '@/lib/bibleTypes';

// Translation metadata
export interface BibleTranslation {
  id: string;
  name: string;
  shortName: string;
  description: string;
  language: string;
}

export const AVAILABLE_TRANSLATIONS: BibleTranslation[] = [
  { id: 'ACF', name: 'Almeida Corrigida e Fiel', shortName: 'ACF', description: 'Tradução tradicional fiel ao original (1994)', language: 'pt' },
  { id: 'ARA', name: 'Almeida Revista e Atualizada', shortName: 'ARA', description: 'Tradução amplamente usada no Brasil (1993)', language: 'pt' },
  { id: 'ARC', name: 'Almeida Revista e Corrigida', shortName: 'ARC', description: 'Versão clássica revisada (1995)', language: 'pt' },
  { id: 'NAA', name: 'Nova Almeida Atualizada', shortName: 'NAA', description: 'Atualização moderna da Almeida (2017)', language: 'pt' },
  { id: 'NVI', name: 'Nova Versão Internacional', shortName: 'NVI', description: 'Tradução contemporânea de fácil leitura', language: 'pt' },
  { id: 'NVT', name: 'Nova Versão Transformadora', shortName: 'NVT', description: 'Tradução moderna e acessível', language: 'pt' },
  { id: 'NTLH', name: 'Nova Tradução na Linguagem de Hoje', shortName: 'NTLH', description: 'Linguagem simples e atual', language: 'pt' },
  { id: 'KJA', name: 'King James Atualizada', shortName: 'KJA', description: 'King James em português moderno', language: 'pt' },
  { id: 'KJF', name: 'King James Fiel', shortName: 'KJF', description: 'King James em português tradicional', language: 'pt' },
  { id: 'AS21', name: 'Almeida Século 21', shortName: 'AS21', description: 'Almeida em linguagem do século 21', language: 'pt' },
  { id: 'TB', name: 'Tradução Brasileira', shortName: 'TB', description: 'Tradução Brasileira clássica', language: 'pt' },
  { id: 'JFAA', name: 'João Ferreira de Almeida Atualizada', shortName: 'JFAA', description: 'Atualização da tradução de Almeida', language: 'pt' },
  { id: 'NBV', name: 'Nova Bíblia Viva', shortName: 'NBV', description: 'Versão em linguagem contemporânea', language: 'pt' },
];

// Book abbreviation mapping from damarals/biblias format
const BOOK_ABBREV_MAP: Record<string, string> = {
  'Gn': 'gn', 'Ex': 'ex', 'Lv': 'lv', 'Nm': 'nm', 'Dt': 'dt',
  'Js': 'js', 'Jz': 'jz', 'Rt': 'rt', '1Sm': '1sm', '2Sm': '2sm',
  '1Rs': '1rs', '2Rs': '2rs', '1Cr': '1cr', '2Cr': '2cr', 'Ed': 'ed',
  'Ne': 'ne', 'Et': 'et', 'Jó': 'jó', 'Sl': 'sl', 'Pv': 'pv',
  'Ec': 'ec', 'Ct': 'ct', 'Is': 'is', 'Jr': 'jr', 'Lm': 'lm',
  'Ez': 'ez', 'Dn': 'dn', 'Os': 'os', 'Jl': 'jl', 'Am': 'am',
  'Ob': 'ob', 'Jn': 'jn', 'Mq': 'mq', 'Na': 'na', 'Hc': 'hc',
  'Sf': 'sf', 'Ag': 'ag', 'Zc': 'zc', 'Ml': 'ml',
  'Mt': 'mt', 'Mc': 'mc', 'Lc': 'lc', 'Jo': 'jo', 'At': 'at',
  'Rm': 'rm', '1Co': '1co', '2Co': '2co', 'Gl': 'gl', 'Ef': 'ef',
  'Fp': 'fp', 'Cl': 'cl', '1Ts': '1ts', '2Ts': '2ts', '1Tm': '1tm',
  '2Tm': '2tm', 'Tt': 'tt', 'Fm': 'fm', 'Hb': 'hb', 'Tg': 'tg',
  '1Pe': '1pe', '2Pe': '2pe', '1Jo': '1jo', '2Jo': '2jo', '3Jo': '3jo',
  'Jd': 'jd', 'Ap': 'ap',
};

// Reverse mapping for lookup
const ABBREV_TO_INDEX: Record<string, number> = {
  'gn': 0, 'ex': 1, 'lv': 2, 'nm': 3, 'dt': 4,
  'js': 5, 'jz': 6, 'rt': 7, '1sm': 8, '2sm': 9,
  '1rs': 10, '2rs': 11, '1cr': 12, '2cr': 13, 'ed': 14,
  'ne': 15, 'et': 16, 'jó': 17, 'sl': 18, 'pv': 19,
  'ec': 20, 'ct': 21, 'is': 22, 'jr': 23, 'lm': 24,
  'ez': 25, 'dn': 26, 'os': 27, 'jl': 28, 'am': 29,
  'ob': 30, 'jn': 31, 'mq': 32, 'na': 33, 'hc': 34,
  'sf': 35, 'ag': 36, 'zc': 37, 'ml': 38,
  'mt': 39, 'mc': 40, 'lc': 41, 'jo': 42, 'at': 43,
  'rm': 44, '1co': 45, '2co': 46, 'gl': 47, 'ef': 48,
  'fp': 49, 'cl': 50, '1ts': 51, '2ts': 52, '1tm': 53,
  '2tm': 54, 'tt': 55, 'fm': 56, 'hb': 57, 'tg': 58,
  '1pe': 59, '2pe': 60, '1jo': 61, '2jo': 62, '3jo': 63,
  'jd': 64, 'ap': 65
};

interface TranslationBook {
  abbrev: string;
  chapters: string[][];
}

interface BibleVerse {
  verse_number: number;
  text: string;
  studies: string[];
  id: string;
  tags?: string[];
}

interface BibleChapter {
  chapter_number: number;
  verses: BibleVerse[];
}

interface BibleBook {
  title: string;
  abbrev: string;
  chapters: BibleChapter[];
}

// Helper function to get chapter count for each book
function getChapterCount(abbrev: string): number {
  const counts: Record<string, number> = {
    'gn': 50, 'ex': 40, 'lv': 27, 'nm': 36, 'dt': 34,
    'js': 24, 'jz': 21, 'rt': 4, '1sm': 31, '2sm': 24,
    '1rs': 22, '2rs': 25, '1cr': 29, '2cr': 36, 'ed': 10,
    'ne': 13, 'et': 10, 'jó': 42, 'sl': 150, 'pv': 31,
    'ec': 12, 'ct': 8, 'is': 66, 'jr': 52, 'lm': 5,
    'ez': 48, 'dn': 12, 'os': 14, 'jl': 3, 'am': 9,
    'ob': 1, 'jn': 4, 'mq': 7, 'na': 3, 'hc': 3,
    'sf': 3, 'ag': 2, 'zc': 14, 'ml': 4,
    'mt': 28, 'mc': 16, 'lc': 24, 'jo': 21, 'at': 28,
    'rm': 16, '1co': 16, '2co': 13, 'gl': 6, 'ef': 6,
    'fp': 4, 'cl': 4, '1ts': 5, '2ts': 3, '1tm': 6,
    '2tm': 4, 'tt': 3, 'fm': 1, 'hb': 13, 'tg': 5,
    '1pe': 5, '2pe': 3, '1jo': 5, '2jo': 1, '3jo': 1,
    'jd': 1, 'ap': 22
  };
  return counts[abbrev.toLowerCase()] || 1;
}

// Cache for loaded translations
const translationsCache: Record<string, TranslationBook[]> = {};

export function useBibleTranslations() {
  const [currentTranslation, setCurrentTranslation] = useState<string>('ACF');
  const [translationData, setTranslationData] = useState<TranslationBook[] | null>(null);
  const [bookCache, setBookCache] = useState<Record<string, BibleBook>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const books = useMemo(() => {
    const allBooks = [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS];
    return allBooks.map(abbrev => ({
      abbrev,
      title: getBookName(abbrev),
      name: getBookName(abbrev),
      chaptersCount: getChapterCount(abbrev),
    }));
  }, []);

  const loadTranslation = useCallback(async (translationId: string): Promise<boolean> => {
    // Check cache
    if (translationsCache[translationId]) {
      setTranslationData(translationsCache[translationId]);
      setCurrentTranslation(translationId);
      setBookCache({});
      return true;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/bible/translations/${translationId}.json`);
      if (!response.ok) {
        throw new Error(`Tradução ${translationId} não encontrada`);
      }
      const data: TranslationBook[] = await response.json();
      translationsCache[translationId] = data;
      setTranslationData(data);
      setCurrentTranslation(translationId);
      setBookCache({});
      setLoading(false);
      return true;
    } catch (err) {
      console.error(`Failed to load translation ${translationId}:`, err);
      setError(`Erro ao carregar tradução ${translationId}`);
      setLoading(false);
      return false;
    }
  }, []);

  const loadBook = useCallback(async (abbrev: string): Promise<BibleBook | null> => {
    const lowerAbbrev = abbrev.toLowerCase();
    
    // Check cache first
    if (bookCache[lowerAbbrev]) {
      return bookCache[lowerAbbrev];
    }

    // Make sure translation is loaded
    if (!translationData) {
      // Try to load current translation
      const loaded = await loadTranslation(currentTranslation);
      if (!loaded) return null;
    }

    const data = translationsCache[currentTranslation];
    if (!data) return null;

    const bookIndex = ABBREV_TO_INDEX[lowerAbbrev];
    if (bookIndex === undefined) {
      setError(`Livro não encontrado: ${abbrev}`);
      return null;
    }

    const translationBook = data[bookIndex];
    if (!translationBook) {
      setError('Dados do livro não encontrados');
      return null;
    }

    // Parse the format into our format
    const chapters: BibleChapter[] = translationBook.chapters.map((chapterVerses, chapterIndex) => {
      const verses: BibleVerse[] = chapterVerses.map((text, verseIndex) => ({
        verse_number: verseIndex + 1,
        text: text,
        studies: [],
        id: `${lowerAbbrev}|${chapterIndex + 1}|${verseIndex + 1}`,
        tags: [],
      }));

      return {
        chapter_number: chapterIndex + 1,
        verses,
      };
    });

    const book: BibleBook = {
      title: getBookName(lowerAbbrev),
      abbrev: lowerAbbrev,
      chapters,
    };
    
    // Cache it
    setBookCache(prev => ({ ...prev, [lowerAbbrev]: book }));
    
    return book;
  }, [translationData, bookCache, currentTranslation, loadTranslation]);

  const getBook = useCallback((abbrev: string): BibleBook | undefined => {
    return bookCache[abbrev.toLowerCase()];
  }, [bookCache]);

  const getChapter = useCallback((abbrev: string, chapter: number): BibleChapter | undefined => {
    const book = bookCache[abbrev.toLowerCase()];
    return book?.chapters.find(c => c.chapter_number === chapter);
  }, [bookCache]);

  const getVerse = useCallback((abbrev: string, chapter: number, verse: number): BibleVerse | undefined => {
    const chapterData = getChapter(abbrev, chapter);
    return chapterData?.verses.find(v => v.verse_number === verse);
  }, [getChapter]);

  const searchBible = useCallback((query: string, limit = 50): BibleVerse[] => {
    if (!query.trim()) return [];
    const results: BibleVerse[] = [];
    const lowerQuery = query.toLowerCase();

    for (const book of Object.values(bookCache)) {
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          if (verse.text.toLowerCase().includes(lowerQuery)) {
            results.push(verse);
            if (results.length >= limit) return results;
          }
        }
      }
    }
    return results;
  }, [bookCache]);

  const getTranslationInfo = useCallback((translationId: string): BibleTranslation | undefined => {
    return AVAILABLE_TRANSLATIONS.find(t => t.id === translationId);
  }, []);

  return {
    // State
    currentTranslation,
    loading,
    error,
    books,
    
    // Translation management
    availableTranslations: AVAILABLE_TRANSLATIONS,
    loadTranslation,
    getTranslationInfo,
    
    // Book/Chapter/Verse access
    loadBook,
    getBook,
    getChapter,
    getVerse,
    searchBible,
    
    // Data state
    dataLoaded: !!translationData,
  };
}
