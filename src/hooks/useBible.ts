import { useState, useEffect } from 'react';
import { loadBible, getChapter, searchBible, BibleBook, BibleVerse, BOOK_NAMES } from '@/lib/bibleData';

export function useBible(translation: string = 'tefilin') {
  const [bible, setBible] = useState<BibleBook[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    loadBible(translation)
      .then(data => {
        setBible(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [translation]);

  const getBooks = () => {
    if (!bible) return [];
    return bible.map(book => ({
      abbrev: book.abbrev,
      name: book.name || BOOK_NAMES[book.abbrev.toLowerCase()] || book.abbrev,
      chaptersCount: book.chapters.length,
    }));
  };

  const getChapterVerses = (bookAbbrev: string, chapter: number): BibleVerse[] => {
    if (!bible) return [];
    return getChapter(bible, bookAbbrev, chapter);
  };

  const search = (query: string, limit = 50): BibleVerse[] => {
    if (!bible || !query.trim()) return [];
    return searchBible(bible, query, limit);
  };

  return {
    bible,
    loading,
    error,
    getBooks,
    getChapterVerses,
    search,
  };
}
