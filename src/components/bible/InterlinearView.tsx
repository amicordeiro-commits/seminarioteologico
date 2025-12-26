import React, { useState, useEffect, useCallback } from 'react';
import { useBibleStrongs } from '@/hooks/useBibleStrongs';
import { parseStrongsText, cleanDefinition, type ParsedWord } from '@/lib/strongsTypes';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BookOpen, Languages } from 'lucide-react';
import { getBookName } from '@/lib/bibleTypes';
import { supabase } from '@/integrations/supabase/client';

interface InterlinearViewProps {
  bookAbbrev: string;
  chapter: number;
  verseNumber: number;
  esvText: string;
  fontSize?: number;
}

export function InterlinearView({ 
  bookAbbrev, 
  chapter, 
  verseNumber, 
  esvText,
  fontSize = 16 
}: InterlinearViewProps) {
  const { lexicon, loading, loadLexicon, getVerseWithStrongs, getStrongsDefinition } = useBibleStrongs();
  const [kjvText, setKjvText] = useState<string | null>(null);
  const [parsedWords, setParsedWords] = useState<ParsedWord[]>([]);
  const [loadingVerse, setLoadingVerse] = useState(false);

  // Load lexicon on mount
  useEffect(() => {
    loadLexicon();
  }, [loadLexicon]);

  // Load KJV verse with Strong's
  useEffect(() => {
    const loadVerse = async () => {
      setLoadingVerse(true);
      const text = await getVerseWithStrongs(bookAbbrev, chapter, verseNumber);
      setKjvText(text);
      if (text) {
        const parsed = parseStrongsText(text);
        setParsedWords(parsed);
      }
      setLoadingVerse(false);
    };
    loadVerse();
  }, [bookAbbrev, chapter, verseNumber, getVerseWithStrongs]);

  if (loadingVerse || loading) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm">Carregando interlinear...</span>
      </div>
    );
  }

  if (!kjvText || parsedWords.length === 0) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border text-center text-muted-foreground">
        <Languages className="h-6 w-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Interlinear não disponível para este versículo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground border-b pb-2">
        <BookOpen className="h-4 w-4" />
        <span className="font-medium">Modo Interlinear</span>
        <Badge variant="outline" className="text-xs">KJV + Strong's</Badge>
      </div>

      {/* ESV Text */}
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground font-medium">ESV:</span>
        <p className="text-foreground" style={{ fontSize: `${fontSize}px` }}>
          <span className="text-primary font-bold mr-2">{verseNumber}</span>
          {esvText}
        </p>
      </div>

      {/* Interlinear Words */}
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground font-medium">Interlinear (KJV com Strong's):</span>
        <div className="flex flex-wrap gap-1">
          {parsedWords.map((word, idx) => (
            <InterlinearWord 
              key={idx} 
              word={word} 
              getDefinition={getStrongsDefinition}
              fontSize={fontSize}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface InterlinearWordProps {
  word: ParsedWord;
  getDefinition: (num: string) => {
    word: string;
    transliteration: string;
    definition: string;
    partOfSpeech: string;
    usage: string;
  } | null;
  fontSize: number;
}

// Cache for translations
const translationCache = new Map<string, { word: string; definition: string; usage: string }>();

function InterlinearWord({ word, getDefinition, fontSize }: InterlinearWordProps) {
  const hasStrongs = word.strongsNumbers.length > 0;
  const [translatedDefs, setTranslatedDefs] = useState<Map<string, { word: string; definition: string; usage: string }>>(new Map());
  const [translating, setTranslating] = useState<Set<string>>(new Set());
  
  // Get definitions for all Strong's numbers
  const definitions = word.strongsNumbers.map(num => ({
    number: num,
    ...getDefinition(num)
  })).filter(d => d.word || d.definition);

  // Translate definition - called on mount for words with Strong's
  const translateDefinition = async (num: string, englishWord: string, definition: string, usage: string) => {
    // Check cache first
    if (translationCache.has(num)) {
      setTranslatedDefs(prev => new Map(prev).set(num, translationCache.get(num)!));
      return;
    }
    
    if (translating.has(num) || translatedDefs.has(num)) return;
    
    setTranslating(prev => new Set(prev).add(num));
    
    try {
      const { data, error } = await supabase.functions.invoke('translate-strongs', {
        body: { word: englishWord, definition, usage }
      });
      
      if (!error && data) {
        const translated = {
          word: data.word || englishWord,
          definition: data.definition || definition,
          usage: data.usage || usage
        };
        translationCache.set(num, translated);
        setTranslatedDefs(prev => new Map(prev).set(num, translated));
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslating(prev => {
        const newSet = new Set(prev);
        newSet.delete(num);
        return newSet;
      });
    }
  };

  // Translate on mount for interlinear display
  useEffect(() => {
    if (hasStrongs && definitions.length > 0) {
      const def = definitions[0];
      if (def && (def.definition || word.text)) {
        translateDefinition(def.number, word.text, def.definition || '', def.usage || '');
      }
    }
  }, [hasStrongs, definitions.length]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Translate all definitions when popover opens
      definitions.forEach(def => {
        if (def.definition || def.usage) {
          translateDefinition(def.number, word.text, def.definition || '', def.usage || '');
        }
      });
    }
  };

  if (!hasStrongs) {
    return (
      <span 
        className={`inline-block px-1 py-0.5 ${word.isItalic ? 'italic text-muted-foreground' : ''}`}
        style={{ fontSize: `${fontSize - 2}px` }}
      >
        {word.text}
      </span>
    );
  }

  // Get translated word for display
  const firstDef = definitions[0];
  const translated = firstDef ? translatedDefs.get(firstDef.number) : null;
  const isTranslatingWord = firstDef ? translating.has(firstDef.number) : false;

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={`
            inline-flex flex-col items-center px-1.5 py-1 rounded
            hover:bg-primary/10 transition-colors cursor-pointer
            border border-transparent hover:border-primary/20
            ${word.isItalic ? 'italic' : ''}
          `}
        >
          {/* Portuguese translation on top */}
          {translated?.word ? (
            <span className="text-green-600 dark:text-green-400 text-[10px] font-medium">
              {translated.word}
            </span>
          ) : isTranslatingWord ? (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          ) : null}
          
          {/* Original English word */}
          <span 
            className="text-foreground font-medium"
            style={{ fontSize: `${fontSize - 2}px` }}
          >
            {word.text}
          </span>
          
          {/* Original language word (Hebrew/Greek) */}
          {definitions[0]?.word && (
            <span className="text-primary text-xs font-semibold">
              {definitions[0].word}
            </span>
          )}
          
          {/* Transliteration */}
          {definitions[0]?.transliteration && (
            <span className="text-muted-foreground text-[10px] italic">
              {definitions[0].transliteration}
            </span>
          )}
          
          {/* Strong's numbers */}
          <div className="flex gap-0.5">
            {word.strongsNumbers.map((num, i) => (
              <span 
                key={i}
                className={`text-[9px] px-1 py-0.5 rounded ${
                  num.startsWith('H') 
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' 
                    : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                }`}
              >
                {num}
              </span>
            ))}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="center">
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-4">
            {definitions.map((def, idx) => {
              const translated = translatedDefs.get(def.number);
              const isTranslating = translating.has(def.number);
              const displayDef = translated?.definition || def.definition;
              const displayUsage = translated?.usage || def.usage;
              
              return (
                <div key={idx} className="space-y-2">
                  {definitions.length > 1 && (
                    <div className="border-b pb-1">
                      <Badge 
                        variant="outline" 
                        className={def.number.startsWith('H') 
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' 
                          : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'}
                      >
                        {def.number}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Original Word & Transliteration */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold text-primary">{def.word}</span>
                    <span className="text-muted-foreground italic">{def.transliteration}</span>
                    <Badge variant="secondary" className="text-xs">
                      {def.number}
                    </Badge>
                  </div>
                  
                  {/* Part of Speech */}
                  {def.partOfSpeech && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Classe:</span> {def.partOfSpeech}
                    </div>
                  )}
                  
                  {/* Definition */}
                  {displayDef && (
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">Definição:</span>
                        {isTranslating && !translated && (
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        )}
                        {translated && (
                          <Badge variant="outline" className="text-[10px] py-0">PT</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-foreground">{displayDef}</p>
                    </div>
                  )}
                  
                  {/* Usage */}
                  {displayUsage && (
                    <div className="text-sm bg-muted/50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">Uso:</span>
                        {isTranslating && !translated && (
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      <p className="mt-1 text-muted-foreground">{displayUsage}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Component for displaying a full chapter in interlinear mode
interface InterlinearChapterProps {
  bookAbbrev: string;
  chapter: number;
  verses: { verse_number: number; text: string }[];
  fontSize?: number;
}

export function InterlinearChapter({ bookAbbrev, chapter, verses, fontSize = 16 }: InterlinearChapterProps) {
  const { lexicon, loadLexicon, getChapterWithStrongs, getStrongsDefinition } = useBibleStrongs();
  const [kjvVerses, setKjvVerses] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLexicon();
  }, [loadLexicon]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getChapterWithStrongs(bookAbbrev, chapter);
      setKjvVerses(data);
      setLoading(false);
    };
    load();
  }, [bookAbbrev, chapter, getChapterWithStrongs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando capítulo interlinear...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm bg-primary/5 p-3 rounded-lg">
        <Languages className="h-5 w-5 text-primary" />
        <span className="font-medium">{getBookName(bookAbbrev)} {chapter}</span>
        <span className="text-muted-foreground">— Modo Interlinear</span>
        <div className="flex gap-2 ml-auto">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
            H = Hebraico
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs">
            G = Grego
          </Badge>
        </div>
      </div>
      
      {verses.map(verse => {
        const kjvText = kjvVerses.get(verse.verse_number);
        const parsedWords = kjvText ? parseStrongsText(kjvText) : [];
        
        return (
          <div key={verse.verse_number} className="space-y-3 pb-4 border-b last:border-0">
            {/* Verse Number */}
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold bg-primary/10 px-2 py-1 rounded text-sm">
                {verse.verse_number}
              </span>
            </div>
            
            {/* ESV Text */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">ESV:</span>
              <p className="text-foreground pl-2" style={{ fontSize: `${fontSize}px` }}>
                {verse.text}
              </p>
            </div>
            
            {/* Interlinear */}
            {parsedWords.length > 0 ? (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Interlinear:</span>
                <div className="flex flex-wrap gap-1 pl-2">
                  {parsedWords.map((word, idx) => (
                    <InterlinearWord 
                      key={idx} 
                      word={word} 
                      getDefinition={getStrongsDefinition}
                      fontSize={fontSize}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic pl-2">
                Interlinear não disponível
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
