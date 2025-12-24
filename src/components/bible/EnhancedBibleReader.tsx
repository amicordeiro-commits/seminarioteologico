import { useState, useEffect } from 'react';
import { useBible } from '@/hooks/useBible';
import { useBibleStudies } from '@/hooks/useBibleStudies';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronLeft, ChevronRight, Search, Book, Loader2, BookOpen, ChevronDown, MessageSquare } from 'lucide-react';
import { BibleVerse, getBookName } from '@/lib/bibleData';
import { OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS, getTestament, getTestamentName, Testament } from '@/lib/bibleTestaments';

interface EnhancedBibleReaderProps {
  onVerseSelect?: (verse: BibleVerse) => void;
  onContextChange?: (context: string) => void;
  onBookChapterChange?: (book: string, chapter: number) => void;
}

export function EnhancedBibleReader({ onVerseSelect, onContextChange, onBookChapterChange }: EnhancedBibleReaderProps) {
  const [translation] = useState('tefilin');
  const [selectedTestament, setSelectedTestament] = useState<Testament>('old');
  const [selectedBook, setSelectedBook] = useState('gn');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  const { loading, error, getBooks, getChapterVerses, search } = useBible(translation);
  const { data: studies, isLoading: studiesLoading } = useBibleStudies(selectedBook, selectedChapter);

  const allBooks = getBooks();
  const oldTestamentBooks = allBooks.filter(b => OLD_TESTAMENT_BOOKS.includes(b.abbrev.toLowerCase()));
  const newTestamentBooks = allBooks.filter(b => NEW_TESTAMENT_BOOKS.includes(b.abbrev.toLowerCase()));
  
  const currentTestamentBooks = selectedTestament === 'old' ? oldTestamentBooks : newTestamentBooks;
  const verses = getChapterVerses(selectedBook, selectedChapter);
  const currentBook = allBooks.find(b => b.abbrev.toLowerCase() === selectedBook.toLowerCase());
  const totalChapters = currentBook?.chaptersCount || 1;

  // Get comments for each verse from studies
  const getVerseComments = (verseNumber: number) => {
    if (!studies) return [];
    return studies.filter(study => 
      study.content.toLowerCase().includes(`versículo ${verseNumber}`) ||
      study.content.toLowerCase().includes(`v.${verseNumber}`) ||
      study.content.toLowerCase().includes(`v. ${verseNumber}`)
    );
  };

  useEffect(() => {
    if (onContextChange && verses.length > 0) {
      const bookName = getBookName(selectedBook);
      const versesText = verses.map(v => `${v.verse}. ${v.text}`).join('\n');
      onContextChange(`${bookName} ${selectedChapter}:\n${versesText}`);
    }
    onBookChapterChange?.(selectedBook, selectedChapter);
  }, [selectedBook, selectedChapter, verses, onContextChange, onBookChapterChange]);

  // Update testament when book changes
  useEffect(() => {
    const testament = getTestament(selectedBook);
    if (testament !== selectedTestament) {
      setSelectedTestament(testament);
    }
  }, [selectedBook]);

  const handleTestamentChange = (testament: Testament) => {
    setSelectedTestament(testament);
    // Select first book of the testament
    const firstBook = testament === 'old' ? 'gn' : 'mt';
    setSelectedBook(firstBook);
    setSelectedChapter(1);
    setSelectedVerses(new Set());
    setExpandedComments(new Set());
  };

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

  const toggleComment = (idx: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const goToPreviousChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
      setSelectedVerses(new Set());
      setExpandedComments(new Set());
    } else {
      const currentIdx = currentTestamentBooks.findIndex(b => b.abbrev.toLowerCase() === selectedBook.toLowerCase());
      if (currentIdx > 0) {
        const prevBook = currentTestamentBooks[currentIdx - 1];
        setSelectedBook(prevBook.abbrev);
        setSelectedChapter(prevBook.chaptersCount);
        setSelectedVerses(new Set());
        setExpandedComments(new Set());
      } else if (selectedTestament === 'new') {
        // Go to last book of Old Testament
        const lastOT = oldTestamentBooks[oldTestamentBooks.length - 1];
        if (lastOT) {
          setSelectedTestament('old');
          setSelectedBook(lastOT.abbrev);
          setSelectedChapter(lastOT.chaptersCount);
          setSelectedVerses(new Set());
          setExpandedComments(new Set());
        }
      }
    }
  };

  const goToNextChapter = () => {
    if (selectedChapter < totalChapters) {
      setSelectedChapter(selectedChapter + 1);
      setSelectedVerses(new Set());
      setExpandedComments(new Set());
    } else {
      const currentIdx = currentTestamentBooks.findIndex(b => b.abbrev.toLowerCase() === selectedBook.toLowerCase());
      if (currentIdx < currentTestamentBooks.length - 1) {
        const nextBook = currentTestamentBooks[currentIdx + 1];
        setSelectedBook(nextBook.abbrev);
        setSelectedChapter(1);
        setSelectedVerses(new Set());
        setExpandedComments(new Set());
      } else if (selectedTestament === 'old') {
        // Go to first book of New Testament
        setSelectedTestament('new');
        setSelectedBook('mt');
        setSelectedChapter(1);
        setSelectedVerses(new Set());
        setExpandedComments(new Set());
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
      {/* Testament Tabs */}
      <Tabs value={selectedTestament} onValueChange={(v) => handleTestamentChange(v as Testament)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="old" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Antigo Testamento
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Novo Testamento
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <Select 
          value={selectedBook} 
          onValueChange={(v) => { 
            setSelectedBook(v); 
            setSelectedChapter(1); 
            setSelectedVerses(new Set()); 
            setExpandedComments(new Set());
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Livro" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {currentTestamentBooks.map(book => (
              <SelectItem key={book.abbrev} value={book.abbrev}>{book.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={String(selectedChapter)} 
          onValueChange={(v) => { 
            setSelectedChapter(Number(v)); 
            setSelectedVerses(new Set()); 
            setExpandedComments(new Set());
          }}
        >
          <SelectTrigger className="w-[140px]">
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
                    const testament = getTestament(result.book);
                    setSelectedTestament(testament);
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
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
        <Button variant="ghost" size="sm" onClick={goToPreviousChapter}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">{getTestamentName(selectedTestament)}</span>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Book className="h-5 w-5 text-primary" />
            {getBookName(selectedBook)} {selectedChapter}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={goToNextChapter}>
          Próximo <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Verses with Comments */}
      <ScrollArea className="h-[450px] border rounded-lg p-4">
        <div className="space-y-3">
          {verses.map((verse, idx) => {
            const comments = getVerseComments(verse.verse);
            const hasComments = comments.length > 0;
            const hasStudy = studies && studies.length > 0;

            return (
              <div key={idx} className="space-y-1">
                <p
                  className={`text-base leading-relaxed cursor-pointer rounded p-2 transition-colors ${
                    selectedVerses.has(idx)
                      ? 'bg-primary/20 border-l-4 border-primary pl-3'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleVerseClick(verse, idx)}
                >
                  <span className="text-primary font-bold text-sm mr-2 bg-primary/10 px-1.5 py-0.5 rounded">
                    {verse.verse}
                  </span>
                  {verse.text}
                </p>

                {/* Comment Section */}
                {hasStudy && (
                  <Collapsible open={expandedComments.has(idx)}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-muted-foreground hover:text-foreground ml-4"
                        onClick={() => toggleComment(idx)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {expandedComments.has(idx) ? 'Ocultar comentário' : 'Ver comentário'}
                        <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${expandedComments.has(idx) ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-4 mt-2 p-3 bg-muted/50 rounded-lg border-l-2 border-primary/30">
                        {hasComments ? (
                          comments.map((comment, cIdx) => (
                            <div key={cIdx} className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{comment.title}</span>
                              <p className="mt-1">{comment.content}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Consulte a aba "Estudos" para comentários sobre este capítulo.
                          </p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Loading indicator for studies */}
      {studiesLoading && (
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Carregando estudos...
        </div>
      )}
    </div>
  );
}
