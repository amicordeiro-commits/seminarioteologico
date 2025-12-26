import { useState, useCallback, useRef, useEffect } from 'react';
import type { StrongsLexicon, KJVBook } from '@/lib/strongsTypes';
import { ESV_TO_KJV_ABBREV, cleanDefinition } from '@/lib/strongsTypes';
import { supabase } from '@/integrations/supabase/client';

// Type for Portuguese translations
interface PortugueseTranslation {
  word: string;
  definition: string;
  usage: string;
}

type PortugueseTranslations = Record<string, PortugueseTranslation>;

// Cache for loaded data
let lexiconCache: StrongsLexicon | null = null;
let portugueseCache: PortugueseTranslations | null = null;
let dbTranslationsLoaded = false;
const bookCache: Map<string, KJVBook> = new Map();

export function useBibleStrongs() {
  const [lexicon, setLexicon] = useState<StrongsLexicon | null>(lexiconCache);
  const [portuguese, setPortuguese] = useState<PortugueseTranslations | null>(portugueseCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  // Load database translations on mount
  useEffect(() => {
    if (!dbTranslationsLoaded) {
      loadDbTranslations();
    }
  }, []);

  // Load translations from database and merge with local file
  const loadDbTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from('strongs_translations')
        .select('strongs_id, portuguese_word, portuguese_definition, portuguese_usage');

      if (error) {
        console.warn('Failed to load DB translations:', error);
        return;
      }

      if (data && data.length > 0) {
        const dbTranslations: PortugueseTranslations = {};
        data.forEach(t => {
          dbTranslations[t.strongs_id] = {
            word: t.portuguese_word,
            definition: t.portuguese_definition,
            usage: t.portuguese_usage || ''
          };
        });

        // Merge with existing cache (DB takes priority)
        portugueseCache = { ...portugueseCache, ...dbTranslations };
        setPortuguese(portugueseCache);
        dbTranslationsLoaded = true;
        console.log(`Loaded ${data.length} translations from database`);
      }
    } catch (err) {
      console.warn('Error loading DB translations:', err);
    }
  };

  // Load the Strong's lexicon and Portuguese translations
  const loadLexicon = useCallback(async () => {
    if (lexiconCache && portugueseCache) {
      setLexicon(lexiconCache);
      setPortuguese(portugueseCache);
      return lexiconCache;
    }
    
    if (loadingRef.current) return null;
    loadingRef.current = true;
    setLoading(true);

    try {
      // Load both files in parallel
      const [lexiconResponse, portugueseResponse] = await Promise.all([
        fetch('/bible/strongs-lexicon.json'),
        fetch('/bible/strongs-portuguese.json')
      ]);
      
      if (!lexiconResponse.ok) throw new Error('Failed to load lexicon');
      
      const lexiconData = await lexiconResponse.json();
      lexiconCache = lexiconData;
      setLexicon(lexiconData);
      
      // Portuguese translations are optional
      if (portugueseResponse.ok) {
        const portugueseData = await portugueseResponse.json();
        portugueseCache = portugueseData;
        setPortuguese(portugueseData);
      }

      // Also load from database
      await loadDbTranslations();
      
      setLoading(false);
      loadingRef.current = false;
      return lexiconData;
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

  // Normalize Strong's number to match both formats (H1 and H0001)
  const normalizeStrongsId = useCallback((id: string): string[] => {
    const prefix = id.charAt(0); // H or G
    const num = id.slice(1).replace(/^0+/, ''); // Remove leading zeros
    const paddedNum = num.padStart(4, '0'); // Add leading zeros
    return [
      `${prefix}${num}`,      // H1, G1
      `${prefix}${paddedNum}` // H0001, G0001
    ];
  }, []);

  // Get Strong's definition with Portuguese translation
  const getStrongsDefinition = useCallback((strongsNumber: string): {
    word: string;
    transliteration: string;
    definition: string;
    partOfSpeech: string;
    usage: string;
    portugueseWord?: string;
    portugueseDefinition?: string;
    portugueseUsage?: string;
  } | null => {
    if (!lexicon) return null;

    const entry = lexicon[strongsNumber];
    if (!entry) return null;

    // Get Portuguese translation - try both formats
    const [shortId, paddedId] = normalizeStrongsId(strongsNumber);
    const pt = portuguese?.[shortId] || portuguese?.[paddedId];

    return {
      word: entry.Gk_word || entry.Hb_word || '',
      transliteration: entry.transliteration || '',
      definition: cleanDefinition(entry.strongs_def || ''),
      partOfSpeech: entry.part_of_speech || '',
      usage: cleanDefinition(entry.outline_usage || ''),
      portugueseWord: pt?.word,
      portugueseDefinition: pt?.definition,
      portugueseUsage: pt?.usage,
    };
  }, [lexicon, portuguese, normalizeStrongsId]);

  return {
    lexicon,
    portuguese,
    loading,
    error,
    loadLexicon,
    loadBook,
    getVerseWithStrongs,
    getChapterWithStrongs,
    getStrongsDefinition,
  };
}
