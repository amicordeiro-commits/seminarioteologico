import { useState, useCallback, useRef, useEffect } from 'react';
import type { StrongsLexicon, KJVBook } from '@/lib/strongsTypes';
import { ESV_TO_KJV_ABBREV, cleanDefinition } from '@/lib/strongsTypes';
import { supabase } from '@/integrations/supabase/client';

// Type for Portuguese translations from full dictionary
interface PortugueseEntry {
  strong_id: string;
  idioma: string;
  termo: string;
  transliteracao: string;
  classe_gramatical: string;
  ditat_ref: string;
  definicoes: string[];
}

interface FullDictionary {
  metadata: {
    nome: string;
    versao: string;
    total_verbetes: number;
  };
  verbetes: PortugueseEntry[];
}

// Processed Portuguese translations
interface PortugueseTranslation {
  word: string;
  definition: string;
  usage: string;
  transliteration?: string;
  partOfSpeech?: string;
}

type PortugueseTranslations = Record<string, PortugueseTranslation>;

// Cache for loaded data
let lexiconCache: StrongsLexicon | null = null;
let portugueseCache: PortugueseTranslations | null = null;
let fullDictionaryLoaded = false;
const bookCache: Map<string, KJVBook> = new Map();

export function useBibleStrongs() {
  const [lexicon, setLexicon] = useState<StrongsLexicon | null>(lexiconCache);
  const [portuguese, setPortuguese] = useState<PortugueseTranslations | null>(portugueseCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  // Load full Portuguese dictionary on mount
  useEffect(() => {
    if (!fullDictionaryLoaded && !portugueseCache) {
      loadFullDictionary();
    }
  }, []);

  // Load the full Portuguese Strong's dictionary
  const loadFullDictionary = async () => {
    try {
      const response = await fetch('/bible/strongs-portuguese-full.json');
      if (!response.ok) {
        console.warn('Failed to load full Portuguese dictionary');
        return;
      }
      
      const data: FullDictionary = await response.json();
      console.log(`Loaded Portuguese dictionary: ${data.metadata.total_verbetes} entries`);
      
      // Convert to our internal format
      const translations: PortugueseTranslations = {};
      
      for (const entry of data.verbetes) {
        // Normalize strong_id: "01" -> "H1" or "G1" based on language
        const prefix = entry.idioma === 'Grego' ? 'G' : 'H';
        const num = parseInt(entry.strong_id, 10);
        
        // Store with multiple formats for lookup
        const ids = [
          `${prefix}${num}`,           // H1, G1
          `${prefix}${String(num).padStart(4, '0')}` // H0001, G0001
        ];
        
        const translation: PortugueseTranslation = {
          word: entry.termo.replace(/'/g, ''),
          definition: entry.definicoes.slice(0, 3).join('; '),
          usage: entry.definicoes.length > 3 ? entry.definicoes.slice(3).join('; ') : '',
          transliteration: entry.transliteracao,
          partOfSpeech: entry.classe_gramatical,
        };
        
        ids.forEach(id => {
          translations[id] = translation;
        });
      }
      
      portugueseCache = translations;
      setPortuguese(translations);
      fullDictionaryLoaded = true;
      console.log(`Processed ${Object.keys(translations).length} Portuguese translations`);
    } catch (err) {
      console.warn('Error loading full dictionary:', err);
    }
  };

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
      
      const lexiconData = await response.json();
      lexiconCache = lexiconData;
      setLexicon(lexiconData);
      
      // Also load full dictionary if not loaded
      if (!fullDictionaryLoaded) {
        await loadFullDictionary();
      }
      
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
    portugueseTransliteration?: string;
    portuguesePartOfSpeech?: string;
  } | null => {
    // Get Portuguese translation first - try both formats
    const [shortId, paddedId] = normalizeStrongsId(strongsNumber);
    const pt = portuguese?.[shortId] || portuguese?.[paddedId];

    // If we have Portuguese data, use it as primary
    if (pt) {
      // Try to get English data from lexicon for fallback
      const entry = lexicon?.[strongsNumber];
      
      return {
        word: pt.word || entry?.Gk_word || entry?.Hb_word || '',
        transliteration: pt.transliteration || entry?.transliteration || '',
        definition: pt.definition || cleanDefinition(entry?.strongs_def || ''),
        partOfSpeech: pt.partOfSpeech || entry?.part_of_speech || '',
        usage: pt.usage || cleanDefinition(entry?.outline_usage || ''),
        portugueseWord: pt.word,
        portugueseDefinition: pt.definition,
        portugueseUsage: pt.usage,
        portugueseTransliteration: pt.transliteration,
        portuguesePartOfSpeech: pt.partOfSpeech,
      };
    }

    // Fallback to English lexicon only
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
