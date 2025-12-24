import { useState, useEffect } from 'react';
import { useBible } from '@/hooks/useBible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search, Book, Loader2 } from 'lucide-react';
import { TRANSLATION_NAMES, BibleVerse, getBookName } from '@/lib/bibleData';

interface BibleReaderProps {
  onVerseSelect?: (verse: BibleVerse) => void;
  onContextChange?: (context: string) => void;
}

export function BibleReader({ onVerseSelect, onContextChange }: BibleReaderProps) {
  const [translation, setTranslation] = useState('nvi');
  const [selectedBook, setSelectedBook] = useState('gn');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());

  const { loading, error, getBooks, getChapterVerses, search } = useBible(translation);

  const books = getBooks();
  const verses = getChapterVerses(selectedBook, selectedChapter);
  const currentBook = books.find(b => b.abbrev.toLowerCase() === selectedBook.toLowerCase());
  const totalChapters = currentBook?.chaptersCount || 1;

  useEffect(() => {
    if (onContextChange && verses.length > 0) {
      const bookName = getBookName(selectedBook);
      const versesText = verses.map(v => `${v.verse}. ${v.text}`).join('\n');
      onContextChange(`${bookName} ${selectedChapter}:\n${versesText}`);
    }
  }, [selectedBook, selectedChapter, verses, onContextChange]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = search(searchQuery, 50);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleVerseClick = (verse: BibleVerse, idx: number) => {
    setSelectedVerses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
    onVerseSelect?.(verse);
  };

  const goToPreviousChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
      setSelectedVerses(new Set());
    } else {
      const currentIdx = books.findIndex(b => b.abbrev.toLowerCase() === selectedBook.toLowerCase());
      if (currentIdx > 0) {
        const prevBook = books[currentIdx - 1];
        setSelectedBook(prevBook.abbrev);
        setSelectedChapter(prevBook.chaptersCount);
        setSelectedVerses(new Set());
      }
    }
  };

  const goToNextChapter = () => {
    if (selectedChapter < totalChapters) {
      setSelectedChapter(selectedChapter + 1);
      setSelectedVerses(new Set());
    } else {
      const currentIdx = books.findIndex(b => b.abbrev.toLowerCase() === selectedBook.toLowerCase());
      if (currentIdx < books.length - 1) {
        const nextBook = books[currentIdx + 1];
        setSelectedBook(nextBook.abbrev);
        setSelectedChapter(1);
        setSelectedVerses(new Set());
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando Bíblia...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive py-8">
        <p>Erro ao carregar a Bíblia: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <Select value={translation} onValueChange={setTranslation}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tradução" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TRANSLATION_NAMES).map(([key, name]) => (
              <SelectItem key={key} value={key}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedBook} onValueChange={(v) => { setSelectedBook(v); setSelectedChapter(1); setSelectedVerses(new Set()); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Livro" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {books.map(book => (
              <SelectItem key={book.abbrev} value={book.abbrev}>{book.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(selectedChapter)} onValueChange={(v) => { setSelectedChapter(Number(v)); setSelectedVerses(new Set()); }}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Capítulo" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {Array.from({ length: totalChapters }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>Capítulo {i + 1}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar na Bíblia..."
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Resultados ({searchResults.length})</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  className="p-2 hover:bg-muted rounded cursor-pointer text-sm"
                  onClick={() => {
                    setSelectedBook(result.book);
                    setSelectedChapter(result.chapter);
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                >
                  <span className="font-medium text-primary">
                    {result.bookName} {result.chapter}:{result.verse}
                  </span>
                  <p className="text-muted-foreground line-clamp-2">{result.text}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Chapter Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={goToPreviousChapter}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Book className="h-5 w-5 text-primary" />
          {getBookName(selectedBook)} {selectedChapter}
        </div>
        <Button variant="outline" size="sm" onClick={goToNextChapter}>
          Próximo <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Verses */}
      <ScrollArea className="h-[400px] border rounded-lg p-4">
        <div className="space-y-2">
          {verses.map((verse, idx) => (
            <p
              key={idx}
              className={`text-base leading-relaxed cursor-pointer rounded p-1 transition-colors ${
                selectedVerses.has(idx)
                  ? 'bg-primary/20 border-l-4 border-primary pl-3'
                  : 'hover:bg-muted'
              }`}
              onClick={() => handleVerseClick(verse, idx)}
            >
              <span className="text-primary font-bold text-sm mr-1">{verse.verse}</span>
              {verse.text}
            </p>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
