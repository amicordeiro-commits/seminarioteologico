import { useState, useEffect, useMemo, useCallback } from 'react';
import { BOOK_NAMES, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS, getBookName } from '@/lib/bibleTypes';

// ACF book abbreviation mapping (lowercase -> index in acf.json)
const ACF_BOOK_INDEX: Record<string, number> = {
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

interface ACFBook {
  id: string;
  name: string;
  chapters: string[][];
}

// Cache for loaded data
let acfData: ACFBook[] | null = null;
const bookCache: Record<string, BibleBook> = {};

export function useBibleESV() {
  const [currentBook, setCurrentBook] = useState<BibleBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load ACF data on mount
  useEffect(() => {
    if (!acfData) {
      fetch('/bible/acf.json')
        .then(res => res.json())
        .then((data: ACFBook[]) => {
          acfData = data;
          setDataLoaded(true);
        })
        .catch(err => {
          console.error('Failed to load ACF Bible:', err);
          setError('Falha ao carregar a Bíblia');
        });
    } else {
      setDataLoaded(true);
    }
  }, []);

  const books = useMemo(() => {
    const allBooks = [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS];
    return allBooks.map(abbrev => ({
      abbrev,
      title: getBookName(abbrev),
      name: getBookName(abbrev),
      chaptersCount: getChapterCount(abbrev),
    }));
  }, []);

  const loadBook = useCallback(async (abbrev: string): Promise<BibleBook | null> => {
    const lowerAbbrev = abbrev.toLowerCase();
    
    // Check cache first
    if (bookCache[lowerAbbrev]) {
      setCurrentBook(bookCache[lowerAbbrev]);
      return bookCache[lowerAbbrev];
    }

    // Wait for data to load
    if (!acfData) {
      setLoading(true);
      // Wait a bit for data to load
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!acfData) {
        setError('Bíblia ainda carregando...');
        setLoading(false);
        return null;
      }
    }

    const bookIndex = ACF_BOOK_INDEX[lowerAbbrev];
    if (bookIndex === undefined) {
      setError(`Livro não encontrado: ${abbrev}`);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const acfBook = acfData[bookIndex];
      
      if (!acfBook) {
        throw new Error('Dados do livro não encontrados');
      }

      // Parse the ACF format into our format
      const chapters: BibleChapter[] = acfBook.chapters.map((chapterVerses, chapterIndex) => {
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
      bookCache[lowerAbbrev] = book;
      setCurrentBook(book);
      setLoading(false);
      
      return book;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
      setLoading(false);
      return null;
    }
  }, []);

  const getBook = useCallback((abbrev: string): BibleBook | undefined => {
    return bookCache[abbrev.toLowerCase()];
  }, []);

  const getChapter = useCallback((abbrev: string, chapter: number): BibleChapter | undefined => {
    const book = bookCache[abbrev.toLowerCase()];
    return book?.chapters.find(c => c.chapter_number === chapter);
  }, []);

  const getVerse = useCallback((abbrev: string, chapter: number, verse: number): BibleVerse | undefined => {
    const chapterData = getChapter(abbrev, chapter);
    return chapterData?.verses.find(v => v.verse_number === verse);
  }, [getChapter]);

  const searchBible = useCallback((query: string, limit = 50): BibleVerse[] => {
    if (!query.trim() || !acfData) return [];
    const results: BibleVerse[] = [];
    const lowerQuery = query.toLowerCase();

    // Search through all books
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
  }, []);

  return {
    bible: currentBook,
    loading,
    error,
    books,
    getBook,
    getChapter,
    getVerse,
    searchBible,
    loadBook,
    currentBook,
    info: null,
    tableOfContents: [],
    dataLoaded,
  };
}

// Helper function to get approximate chapter count for each book
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