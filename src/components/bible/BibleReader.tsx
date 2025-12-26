import { useState, useEffect } from 'react';
import { useBibleESV } from '@/hooks/useBibleESV';
import { getBookName, getTestament, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '@/lib/bibleTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, Book, Loader2, BookOpen, ChevronDown, MessageSquare } from 'lucide-react';

export function BibleReader() {
  const { loading, error, books, getChapter } = useBibleESV();
  const [selectedTestament, setSelectedTestament] = useState<'old' | 'new'>('old');
  const [selectedBook, setSelectedBook] = useState('gn');
  const [selectedChapterNum, setSelectedChapterNum] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudies, setExpandedStudies] = useState<Set<number>>(new Set());

  const testamentBooks = books.filter(b => 
    selectedTestament === 'old' 
      ? OLD_TESTAMENT_BOOKS.includes(b.abbrev.toLowerCase())
      : NEW_TESTAMENT_BOOKS.includes(b.abbrev.toLowerCase())
  );

  const currentBook = books.find(b => b.abbrev.toLowerCase() === selectedBook.toLowerCase());
  const totalChapters = currentBook?.chaptersCount || 1;
  const chapter = getChapter(selectedBook, selectedChapterNum);

  useEffect(() => {
    const testament = getTestament(selectedBook);
    if (testament !== selectedTestament) {
      setSelectedTestament(testament);
    }
  }, [selectedBook]);

  const handleTestamentChange = (testament: 'old' | 'new') => {
    setSelectedTestament(testament);
    const firstBook = testament === 'old' ? 'gn' : 'mt';
    setSelectedBook(firstBook);
    setSelectedChapterNum(1);
    setExpandedStudies(new Set());
  };

  const toggleStudy = (verseNum: number) => {
    setExpandedStudies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(verseNum)) {
        newSet.delete(verseNum);
      } else {
        newSet.add(verseNum);
      }
      return newSet;
    });
  };

  const goToPreviousChapter = () => {
    if (selectedChapterNum > 1) {
      setSelectedChapterNum(selectedChapterNum - 1);
      setExpandedStudies(new Set());
    } else {
      const currentIdx = testamentBooks.findIndex(b => b.abbrev.toLowerCase() === selectedBook.toLowerCase());
      if (currentIdx > 0) {
        const prevBook = testamentBooks[currentIdx - 1];
        setSelectedBook(prevBook.abbrev);
        setSelectedChapterNum(prevBook.chaptersCount);
        setExpandedStudies(new Set());
      } else if (selectedTestament === 'new') {
        const oldBooks = books.filter(b => OLD_TESTAMENT_BOOKS.includes(b.abbrev.toLowerCase()));
        const lastOT = oldBooks[oldBooks.length - 1];
        if (lastOT) {
          setSelectedTestament('old');
          setSelectedBook(lastOT.abbrev);
          setSelectedChapterNum(lastOT.chaptersCount);
          setExpandedStudies(new Set());
        }
      }
    }
  };

  const goToNextChapter = () => {
    if (selectedChapterNum < totalChapters) {
      setSelectedChapterNum(selectedChapterNum + 1);
      setExpandedStudies(new Set());
    } else {
      const currentIdx = testamentBooks.findIndex(b => b.abbrev.toLowerCase() === selectedBook.toLowerCase());
      if (currentIdx < testamentBooks.length - 1) {
        const nextBook = testamentBooks[currentIdx + 1];
        setSelectedBook(nextBook.abbrev);
        setSelectedChapterNum(1);
        setExpandedStudies(new Set());
      } else if (selectedTestament === 'old') {
        setSelectedTestament('new');
        setSelectedBook('mt');
        setSelectedChapterNum(1);
        setExpandedStudies(new Set());
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando Bíblia de Estudo ESV...</span>
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
      <Tabs value={selectedTestament} onValueChange={(v) => handleTestamentChange(v as 'old' | 'new')}>
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
            setSelectedChapterNum(1); 
            setExpandedStudies(new Set());
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Livro" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {testamentBooks.map(book => (
              <SelectItem key={book.abbrev} value={book.abbrev}>{book.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={String(selectedChapterNum)} 
          onValueChange={(v) => { 
            setSelectedChapterNum(Number(v)); 
            setExpandedStudies(new Set());
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

      {/* Chapter Navigation */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
        <Button variant="ghost" size="sm" onClick={goToPreviousChapter}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">
            {selectedTestament === 'old' ? 'Antigo Testamento' : 'Novo Testamento'}
          </span>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Book className="h-5 w-5 text-primary" />
            {getBookName(selectedBook)} {selectedChapterNum}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={goToNextChapter}>
          Próximo <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Verses with Studies */}
      <ScrollArea className="h-[500px] border rounded-lg p-4">
        <div className="space-y-3">
          {chapter?.verses.map((verse) => {
            const hasStudies = verse.studies && verse.studies.length > 0;

            return (
              <div key={verse.id} className="space-y-1">
                <p className="text-base leading-relaxed p-2 hover:bg-muted rounded transition-colors">
                  <span className="text-primary font-bold text-sm mr-2 bg-primary/10 px-1.5 py-0.5 rounded">
                    {verse.verse_number}
                  </span>
                  {verse.text}
                  {verse.tags && verse.tags.length > 0 && (
                    <span className="ml-2">
                      {verse.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs ml-1">
                          {tag}
                        </Badge>
                      ))}
                    </span>
                  )}
                </p>

                {hasStudies && (
                  <Collapsible open={expandedStudies.has(verse.verse_number)}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs text-muted-foreground hover:text-foreground ml-4"
                        onClick={() => toggleStudy(verse.verse_number)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {expandedStudies.has(verse.verse_number) ? 'Ocultar estudo' : 'Ver estudo'}
                        <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${expandedStudies.has(verse.verse_number) ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-4 mt-2 space-y-2">
                        {verse.studies.map((study, idx) => (
                          <div key={idx} className="p-3 bg-muted/50 rounded-lg border-l-2 border-primary/30">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{study}</p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
