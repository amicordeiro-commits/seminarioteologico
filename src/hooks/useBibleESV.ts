import { useState, useEffect, useMemo } from 'react';
import type { BibleData, BibleBook, BibleChapter, BibleVerse } from '@/lib/bibleTypes';
import { getBookName } from '@/lib/bibleTypes';

let cachedBible: BibleData | null = null;

export function useBibleESV() {
  const [bible, setBible] = useState<BibleData | null>(cachedBible);
  const [loading, setLoading] = useState(!cachedBible);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedBible) {
      setBible(cachedBible);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('/bible/esv-study.json')
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar a Bíblia');
        return res.json();
      })
      .then((data: BibleData) => {
        cachedBible = data;
        setBible(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const books = useMemo(() => {
    if (!bible) return [];
    return bible.bible_content.map(book => ({
      abbrev: book.abbrev,
      title: book.title,
      name: getBookName(book.abbrev),
      chaptersCount: book.chapters.length,
    }));
  }, [bible]);

  const getBook = (abbrev: string): BibleBook | undefined => {
    return bible?.bible_content.find(
      b => b.abbrev.toLowerCase() === abbrev.toLowerCase()
    );
  };

  const getChapter = (abbrev: string, chapter: number): BibleChapter | undefined => {
    const book = getBook(abbrev);
    return book?.chapters.find(c => c.chapter_number === chapter);
  };

  const getVerse = (abbrev: string, chapter: number, verse: number): BibleVerse | undefined => {
    const chapterData = getChapter(abbrev, chapter);
    return chapterData?.verses.find(v => v.verse_number === verse);
  };

  const searchBible = (query: string, limit = 50): BibleVerse[] => {
    if (!bible || !query.trim()) return [];
    const results: BibleVerse[] = [];
    const lowerQuery = query.toLowerCase();

    for (const book of bible.bible_content) {
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
  };

  return {
    bible,
    loading,
    error,
    books,
    getBook,
    getChapter,
    getVerse,
    searchBible,
    info: bible?.info,
    tableOfContents: bible?.table_of_contents,
  };
}
