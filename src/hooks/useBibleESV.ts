import { useState, useEffect, useMemo, useCallback } from 'react';
import { BOOK_NAMES, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS, getBookName } from '@/lib/bibleTypes';

// KJV book abbreviation to file mapping
const KJV_BOOKS: Record<string, string> = {
  'gn': 'Gen', 'ex': 'Exo', 'lv': 'Lev', 'nm': 'Num', 'dt': 'Deu',
  'js': 'Jos', 'jz': 'Jdg', 'rt': 'Rth', '1sm': '1Sa', '2sm': '2Sa',
  '1rs': '1Ki', '2rs': '2Ki', '1cr': '1Ch', '2cr': '2Ch', 'ed': 'Ezr',
  'ne': 'Neh', 'et': 'Est', 'jó': 'Job', 'sl': 'Psa', 'pv': 'Pro',
  'ec': 'Ecc', 'ct': 'Sng', 'is': 'Isa', 'jr': 'Jer', 'lm': 'Lam',
  'ez': 'Eze', 'dn': 'Dan', 'os': 'Hos', 'jl': 'Joe', 'am': 'Amo',
  'ob': 'Oba', 'jn': 'Jon', 'mq': 'Mic', 'na': 'Nah', 'hc': 'Hab',
  'sf': 'Zep', 'ag': 'Hag', 'zc': 'Zec', 'ml': 'Mal',
  'mt': 'Mat', 'mc': 'Mar', 'lc': 'Luk', 'jo': 'Jhn', 'at': 'Act',
  'rm': 'Rom', '1co': '1Co', '2co': '2Co', 'gl': 'Gal', 'ef': 'Eph',
  'fp': 'Phl', 'cl': 'Col', '1ts': '1Th', '2ts': '2Th', '1tm': '1Ti',
  '2tm': '2Ti', 'tt': 'Tit', 'fm': 'Phm', 'hb': 'Heb', 'tg': 'Jas',
  '1pe': '1Pe', '2pe': '2Pe', '1jo': '1Jo', '2jo': '2Jo', '3jo': '3Jo',
  'jd': 'Jde', 'ap': 'Rev'
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

// Cache for loaded books
const bookCache: Record<string, BibleBook> = {};

export function useBibleESV() {
  const [currentBook, setCurrentBook] = useState<BibleBook | null>(null);
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

  const loadBook = useCallback(async (abbrev: string): Promise<BibleBook | null> => {
    const lowerAbbrev = abbrev.toLowerCase();
    
    // Check cache first
    if (bookCache[lowerAbbrev]) {
      setCurrentBook(bookCache[lowerAbbrev]);
      return bookCache[lowerAbbrev];
    }

    const kjvAbbrev = KJV_BOOKS[lowerAbbrev];
    if (!kjvAbbrev) {
      setError(`Livro não encontrado: ${abbrev}`);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/bible/kjv/${kjvAbbrev}.json`);
      if (!response.ok) throw new Error('Falha ao carregar o livro');
      
      const data = await response.json();
      const bookData = data[kjvAbbrev];
      
      if (!bookData) throw new Error('Dados do livro não encontrados');

      // Parse the KJV format into our format
      const chapters: BibleChapter[] = [];
      
      for (const chapterKey of Object.keys(bookData)) {
        const [, chapterNum] = chapterKey.split('|');
        const chapterNumber = parseInt(chapterNum);
        const chapterData = bookData[chapterKey];
        
        const verses: BibleVerse[] = [];
        
        for (const verseKey of Object.keys(chapterData)) {
          const [, , verseNum] = verseKey.split('|');
          const verseNumber = parseInt(verseNum);
          const verseData = chapterData[verseKey];
          
          // Clean up the English text (remove Strong's numbers for display)
          let text = verseData.en || '';
          text = text.replace(/\[H\d+\]/g, '').replace(/\[G\d+\]/g, '');
          text = text.replace(/<\/?em>/g, '');
          text = text.replace(/\s+/g, ' ').trim();
          
          verses.push({
            verse_number: verseNumber,
            text,
            studies: [],
            id: verseKey,
            tags: [],
          });
        }
        
        // Sort verses by number
        verses.sort((a, b) => a.verse_number - b.verse_number);
        
        chapters.push({
          chapter_number: chapterNumber,
          verses,
        });
      }
      
      // Sort chapters by number
      chapters.sort((a, b) => a.chapter_number - b.chapter_number);
      
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
