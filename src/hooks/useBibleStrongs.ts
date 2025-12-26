import { useState, useCallback, useRef } from 'react';
import type { StrongsLexicon, KJVBook } from '@/lib/strongsTypes';
import { ESV_TO_KJV_ABBREV, cleanDefinition } from '@/lib/strongsTypes';

// Cache for loaded data
let lexiconCache: StrongsLexicon | null = null;
const bookCache: Map<string, KJVBook> = new Map();

export function useBibleStrongs() {
  const [lexicon, setLexicon] = useState<StrongsLexicon | null>(lexiconCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  // Load the Strong's lexicon
  const loadLexicon = useCallback(async () => {
    if (lexiconCache) {
      setLexicon(lexiconCache);
      return lexiconCache;
    }
    
    if (loadingRef.current) return null;
    loadingRef.current = true;
    setLoading(true);

    try {
      const response = await fetch('/bible/strongs-lexicon.json');
      if (!response.ok) throw new Error('Failed to load lexicon');
      const data = await response.json();
      lexiconCache = data;
      setLexicon(data);
      setLoading(false);
      loadingRef.current = false;
      return data;
    } catch (err) {
      setError('Falha ao carregar léxico Strong');
      setLoading(false);
      loadingRef.current = false;
      return null;
    }
  }, []);

  // Load a specific KJV book
  const loadBook = useCallback(async (kjvAbbrev: string): Promise<KJVBook | null> => {
    // Check cache
    if (bookCache.has(kjvAbbrev)) {
      return bookCache.get(kjvAbbrev)!;
    }

    try {
      const response = await fetch(`/bible/kjv/${kjvAbbrev}.json`);
      if (!response.ok) {
        console.warn(`KJV book ${kjvAbbrev} not available`);
        return null;
      }
      const data = await response.json();
      bookCache.set(kjvAbbrev, data);
      return data;
    } catch (err) {
      console.warn(`Failed to load KJV book ${kjvAbbrev}`);
      return null;
    }
  }, []);

  // Get verse text with Strong's numbers
  const getVerseWithStrongs = useCallback(async (
    esvAbbrev: string, 
    chapter: number, 
    verse: number
  ): Promise<string | null> => {
    const kjvAbbrev = ESV_TO_KJV_ABBREV[esvAbbrev.toLowerCase()];
    
    if (!kjvAbbrev) {
      console.warn(`No KJV mapping for ${esvAbbrev}`);
      return null;
    }

    const book = await loadBook(kjvAbbrev);
    if (!book) return null;

    const bookData = book[kjvAbbrev];
    if (!bookData) return null;

    const chapterKey = `${kjvAbbrev}|${chapter}`;
    const chapterData = bookData[chapterKey];
    if (!chapterData) return null;

    const verseKey = `${kjvAbbrev}|${chapter}|${verse}`;
    const verseData = chapterData[verseKey];
    
    return verseData?.en || null;
  }, [loadBook]);

  // Get all verses for a chapter with Strong's
  const getChapterWithStrongs = useCallback(async (
    esvAbbrev: string,
    chapter: number
  ): Promise<Map<number, string>> => {
    const kjvAbbrev = ESV_TO_KJV_ABBREV[esvAbbrev.toLowerCase()];
    const result = new Map<number, string>();

    if (!kjvAbbrev) return result;

    const book = await loadBook(kjvAbbrev);
    if (!book) return result;

    const bookData = book[kjvAbbrev];
    if (!bookData) return result;

    const chapterKey = `${kjvAbbrev}|${chapter}`;
    const chapterData = bookData[chapterKey];
    if (!chapterData) return result;

    // Extract all verses for this chapter
    for (const [verseKey, verseData] of Object.entries(chapterData)) {
      const parts = verseKey.split('|');
      if (parts.length === 3) {
        const verseNum = parseInt(parts[2]);
        if (verseData.en) {
          result.set(verseNum, verseData.en);
        }
      }
    }

    return result;
  }, [loadBook]);

  // Get Strong's definition
  const getStrongsDefinition = useCallback((strongsNumber: string): {
    word: string;
    transliteration: string;
    definition: string;
    partOfSpeech: string;
    usage: string;
  } | null => {
    if (!lexicon) return null;

    const entry = lexicon[strongsNumber];
    if (!entry) return null;

    

    return {
      word: entry.Gk_word || entry.Hb_word || '',
      transliteration: entry.transliteration || '',
      definition: cleanDefinition(entry.strongs_def || ''),
      partOfSpeech: entry.part_of_speech || '',
      usage: cleanDefinition(entry.outline_usage || ''),
    };
  }, [lexicon]);

  return {
    lexicon,
    loading,
    error,
    loadLexicon,
    loadBook,
    getVerseWithStrongs,
    getChapterWithStrongs,
    getStrongsDefinition,
  };
}
