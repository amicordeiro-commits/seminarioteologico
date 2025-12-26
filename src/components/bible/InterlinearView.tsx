import React, { useState, useEffect } from 'react';
import { useBibleStrongs } from '@/hooks/useBibleStrongs';
import { parseStrongsText, type ParsedWord } from '@/lib/strongsTypes';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BookOpen, Languages } from 'lucide-react';
import { getBookName } from '@/lib/bibleTypes';

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
    portugueseWord?: string;
    portugueseDefinition?: string;
    portugueseUsage?: string;
    portugueseTransliteration?: string;
    portuguesePartOfSpeech?: string;
  } | null;
  fontSize: number;
}

function InterlinearWord({ word, getDefinition, fontSize }: InterlinearWordProps) {
  const hasStrongs = word.strongsNumbers.length > 0;
  
  // Get definitions for all Strong's numbers (includes Portuguese from offline file)
  const definitions = word.strongsNumbers.map(num => ({
    number: num,
    ...getDefinition(num)
  })).filter(d => d.word || d.definition);

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

  // Get Portuguese translation from offline data
  const firstDef = definitions[0];
  const portugueseWord = firstDef?.portugueseWord;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`
            inline-flex flex-col items-center px-1.5 py-1 rounded
            hover:bg-primary/10 transition-colors cursor-pointer
            border border-transparent hover:border-primary/20
            ${word.isItalic ? 'italic' : ''}
          `}
        >
          {/* Portuguese translation on top (from offline file) */}
          {portugueseWord && (
            <span className="text-green-600 dark:text-green-400 text-[10px] font-medium">
              {portugueseWord}
            </span>
          )}
          
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
              // Use Portuguese translations from offline file
              const displayDef = def.portugueseDefinition || def.definition;
              const displayUsage = def.portugueseUsage || def.usage;
              const hasPtTranslation = !!def.portugueseDefinition;
              
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl font-semibold text-primary">{def.word}</span>
                    <span className="text-muted-foreground italic">{def.transliteration}</span>
                    <Badge variant="secondary" className="text-xs">
                      {def.number}
                    </Badge>
                    {hasPtTranslation && (
                      <Badge variant="outline" className="text-[10px] py-0 bg-green-500/10 text-green-700 dark:text-green-400">
                        PT
                      </Badge>
                    )}
                  </div>
                  
                  {/* Portuguese Word Translation */}
                  {def.portugueseWord && (
                    <div className="text-sm bg-green-500/10 p-2 rounded">
                      <span className="font-medium text-green-700 dark:text-green-400">Tradução:</span>
                      <span className="ml-2 font-semibold">{def.portugueseWord}</span>
                    </div>
                  )}
                  
                  {/* Part of Speech */}
                  {def.partOfSpeech && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Classe:</span> {def.partOfSpeech}
                    </div>
                  )}
                  
                  {/* Definition */}
                  {displayDef && (
                    <div className="text-sm">
                      <span className="font-medium text-primary">Definição:</span>
                      <p className="mt-1 text-foreground">{displayDef}</p>
                    </div>
                  )}
                  
                  {/* Usage */}
                  {displayUsage && (
                    <div className="text-sm bg-muted/50 p-2 rounded">
                      <span className="font-medium text-primary">Uso:</span>
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
