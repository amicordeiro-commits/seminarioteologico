import { useState, useEffect, useMemo } from 'react';
import { useBibleESV } from '@/hooks/useBibleESV';
import { useBibleBookmarks } from '@/hooks/useBibleBookmarks';
import { useBibleNotes } from '@/hooks/useBibleNotes';
import { getBookName, getTestament, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '@/lib/bibleTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { InterlinearChapter } from '@/components/bible/InterlinearView';
import { 
  ChevronLeft, ChevronRight, Search, Book, Loader2, BookOpen, ChevronDown, 
  MessageSquare, Heart, Bookmark, PenLine, Copy, List, Settings2, 
  Type, Tag, X, Check, Languages
} from 'lucide-react';
import { toast } from 'sonner';

export function BibleReader() {
  const { loading, error, books, getChapter, searchBible, tableOfContents, info } = useBibleESV();
  const { bookmarks, isBookmarked, toggleBookmark } = useBibleBookmarks();
  const { notes, saveNote, getNoteForVerse } = useBibleNotes();
  
  const [selectedTestament, setSelectedTestament] = useState<'old' | 'new'>('old');
  const [selectedBook, setSelectedBook] = useState('gn');
  const [selectedChapterNum, setSelectedChapterNum] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedStudies, setExpandedStudies] = useState<Set<number>>(new Set());
  const [goToRef, setGoToRef] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [studyMode, setStudyMode] = useState(false);
  const [interlinearMode, setInterlinearMode] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState('read');

  const testamentBooks = books.filter(b => 
    selectedTestament === 'old' 
      ? OLD_TESTAMENT_BOOKS.includes(b.abbrev.toLowerCase())
      : NEW_TESTAMENT_BOOKS.includes(b.abbrev.toLowerCase())
  );

  const currentBook = books.find(b => b.abbrev.toLowerCase() === selectedBook.toLowerCase());
  const totalChapters = currentBook?.chaptersCount || 1;
  const chapter = getChapter(selectedBook, selectedChapterNum);

  // Collect all unique tags from current chapter
  const chapterTags = useMemo(() => {
    if (!chapter) return [];
    const tags = new Set<string>();
    chapter.verses.forEach(v => v.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [chapter]);

  // Filter verses by tag
  const filteredVerses = useMemo(() => {
    if (!chapter) return [];
    if (!selectedTag) return chapter.verses;
    return chapter.verses.filter(v => v.tags?.includes(selectedTag));
  }, [chapter, selectedTag]);

  useEffect(() => {
    const testament = getTestament(selectedBook);
    if (testament !== selectedTestament) {
      setSelectedTestament(testament);
    }
  }, [selectedBook]);

  // Study mode: expand all studies
  useEffect(() => {
    if (studyMode && chapter) {
      const allWithStudies = new Set(
        chapter.verses
          .filter(v => v.studies && v.studies.length > 0)
          .map(v => v.verse_number)
      );
      setExpandedStudies(allWithStudies);
    } else if (!studyMode) {
      setExpandedStudies(new Set());
    }
  }, [studyMode, chapter]);

  const handleTestamentChange = (testament: 'old' | 'new') => {
    setSelectedTestament(testament);
    const firstBook = testament === 'old' ? 'gn' : 'mt';
    setSelectedBook(firstBook);
    setSelectedChapterNum(1);
    setExpandedStudies(new Set());
    setSelectedTag(null);
  };

  const toggleStudy = (verseNum: number) => {
    if (studyMode) return;
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
      setSelectedTag(null);
    } else {
      const currentIdx = testamentBooks.findIndex(b => b.abbrev.toLowerCase() === selectedBook.toLowerCase());
      if (currentIdx > 0) {
        const prevBook = testamentBooks[currentIdx - 1];
        setSelectedBook(prevBook.abbrev);
        setSelectedChapterNum(prevBook.chaptersCount);
      } else if (selectedTestament === 'new') {
        const oldBooks = books.filter(b => OLD_TESTAMENT_BOOKS.includes(b.abbrev.toLowerCase()));
        const lastOT = oldBooks[oldBooks.length - 1];
        if (lastOT) {
          setSelectedTestament('old');
          setSelectedBook(lastOT.abbrev);
          setSelectedChapterNum(lastOT.chaptersCount);
        }
      }
    }
  };

  const goToNextChapter = () => {
    if (selectedChapterNum < totalChapters) {
      setSelectedChapterNum(selectedChapterNum + 1);
      setExpandedStudies(new Set());
      setSelectedTag(null);
    } else {
      const currentIdx = testamentBooks.findIndex(b => b.abbrev.toLowerCase() === selectedBook.toLowerCase());
      if (currentIdx < testamentBooks.length - 1) {
        const nextBook = testamentBooks[currentIdx + 1];
        setSelectedBook(nextBook.abbrev);
        setSelectedChapterNum(1);
      } else if (selectedTestament === 'old') {
        setSelectedTestament('new');
        setSelectedBook('mt');
        setSelectedChapterNum(1);
      }
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = searchBible(searchQuery, 30);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleGoToReference = () => {
    // Parse reference like "João 3:16" or "Jo 3:16" or "gn 1:1"
    const match = goToRef.match(/^(\d?\s*\w+)\s*(\d+):?(\d+)?$/i);
    if (!match) {
      toast.error('Formato inválido. Use: Livro Capítulo:Versículo');
      return;
    }

    const bookInput = match[1].toLowerCase().trim();
    const chapterNum = parseInt(match[2]);
    
    // Find book by name or abbrev
    const book = books.find(b => 
      b.abbrev.toLowerCase() === bookInput ||
      b.name.toLowerCase().includes(bookInput) ||
      b.title?.toLowerCase().includes(bookInput)
    );

    if (!book) {
      toast.error('Livro não encontrado');
      return;
    }

    setSelectedBook(book.abbrev);
    setSelectedChapterNum(chapterNum);
    setSelectedTestament(getTestament(book.abbrev));
    setGoToRef('');
    toast.success(`Indo para ${book.name} ${chapterNum}`);
  };

  const copyVerse = (verse: any) => {
    const text = `${getBookName(selectedBook)} ${selectedChapterNum}:${verse.verse_number} - "${verse.text}"`;
    navigator.clipboard.writeText(text);
    toast.success('Versículo copiado');
  };

  const handleSaveNote = (verseId: string, bookAbbrev: string, chapter: number, verse: number) => {
    if (!noteText.trim()) return;
    saveNote({
      verse_id: verseId,
      book_abbrev: bookAbbrev,
      chapter,
      verse,
      note: noteText,
    });
    setEditingNote(null);
    setNoteText('');
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
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="read" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Leitura
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Favoritos ({bookmarks.length})
          </TabsTrigger>
          <TabsTrigger value="toc" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Índice
          </TabsTrigger>
        </TabsList>

        {/* Reading Tab */}
        <TabsContent value="read" className="space-y-4 mt-4">
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

          {/* Controls Row 1: Book, Chapter, Settings */}
          <div className="flex flex-wrap gap-2 items-center">
            <Select 
              value={selectedBook} 
              onValueChange={(v) => { 
                setSelectedBook(v); 
                setSelectedChapterNum(1); 
                setExpandedStudies(new Set());
                setSelectedTag(null);
              }}
            >
              <SelectTrigger className="w-[160px]">
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
                setSelectedTag(null);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Capítulo" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Array.from({ length: totalChapters }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>Cap. {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Interlinear Mode Toggle - Visible Button */}
            <Button 
              variant={interlinearMode ? "default" : "outline"}
              size="sm"
              onClick={() => setInterlinearMode(!interlinearMode)}
              className="gap-2"
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">Strong's</span>
            </Button>

            {/* Settings Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" title="Configurações">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Configurações de Leitura</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <Label>Tamanho da fonte: {fontSize}px</Label>
                    </div>
                    <Slider
                      value={[fontSize]}
                      onValueChange={(v) => setFontSize(v[0])}
                      min={12}
                      max={24}
                      step={1}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <Label>Modo Estudo</Label>
                    </div>
                    <Switch checked={studyMode} onCheckedChange={setStudyMode} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      <Label>Modo Interlinear (Strong's)</Label>
                    </div>
                    <Switch checked={interlinearMode} onCheckedChange={setInterlinearMode} />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Go to reference */}
            <div className="flex gap-1 flex-1 min-w-[180px]">
              <Input
                value={goToRef}
                onChange={e => setGoToRef(e.target.value)}
                placeholder="Ir para... (ex: João 3:16)"
                className="flex-1"
                onKeyDown={e => e.key === 'Enter' && handleGoToReference()}
              />
              <Button variant="secondary" size="icon" onClick={handleGoToReference}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Controls Row 2: Search */}
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
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Resultados ({searchResults.length})</h4>
                <Button variant="ghost" size="sm" onClick={() => setSearchResults([])}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {searchResults.map((result, idx) => (
                    <div
                      key={idx}
                      className="p-2 hover:bg-muted rounded cursor-pointer text-sm"
                      onClick={() => {
                        const parts = result.id.split('.');
                        if (parts.length >= 2) {
                          setSelectedBook(parts[0].toLowerCase());
                          setSelectedChapterNum(parseInt(parts[1]));
                          setSelectedTestament(getTestament(parts[0].toLowerCase()));
                          setSearchResults([]);
                          setSearchQuery('');
                        }
                      }}
                    >
                      <span className="font-medium text-primary">{result.id}</span>
                      <p className="text-muted-foreground line-clamp-1">{result.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Tags Filter */}
          {chapterTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Badge 
                variant={selectedTag === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(null)}
              >
                Todos
              </Badge>
              {chapterTags.map(tag => (
                <Badge 
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

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

          {/* Verses - Interlinear or Regular Mode */}
          <ScrollArea className="h-[450px] border rounded-lg p-4">
            {interlinearMode ? (
              <InterlinearChapter
                bookAbbrev={selectedBook}
                chapter={selectedChapterNum}
                verses={filteredVerses}
                fontSize={fontSize}
              />
            ) : (
            <div className="space-y-3">
              {filteredVerses.map((verse) => {
                const hasStudies = verse.studies && verse.studies.length > 0;
                const verseNote = getNoteForVerse(verse.id);
                const isVerseBookmarked = isBookmarked(verse.id);

                return (
                  <div key={verse.id} className="space-y-1 group">
                    <div className="flex items-start gap-2">
                      <p 
                        className="flex-1 leading-relaxed p-2 hover:bg-muted rounded transition-colors"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        <span className="text-primary font-bold text-sm mr-2 bg-primary/10 px-1.5 py-0.5 rounded">
                          {verse.verse_number}
                        </span>
                        {verse.text}
                      </p>
                      
                      {/* Verse Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleBookmark({
                            verse_id: verse.id,
                            book_abbrev: selectedBook,
                            chapter: selectedChapterNum,
                            verse: verse.verse_number,
                            verse_text: verse.text,
                          })}
                        >
                          <Bookmark className={`h-4 w-4 ${isVerseBookmarked ? 'fill-primary text-primary' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyVerse(verse)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingNote(verse.id);
                                setNoteText(verseNote?.note || '');
                              }}
                            >
                              <PenLine className={`h-4 w-4 ${verseNote ? 'text-primary' : ''}`} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <Label>Nota pessoal</Label>
                              <Textarea
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                placeholder="Escreva sua nota..."
                                rows={3}
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveNote(verse.id, selectedBook, selectedChapterNum, verse.verse_number)}
                                >
                                  <Check className="h-4 w-4 mr-1" /> Salvar
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Personal Note Display */}
                    {verseNote && (
                      <div className="ml-8 p-2 bg-primary/5 rounded border-l-2 border-primary text-sm">
                        <span className="font-medium text-primary">Sua nota:</span> {verseNote.note}
                      </div>
                    )}

                    {/* Tags */}
                    {verse.tags && verse.tags.length > 0 && (
                      <div className="ml-8 flex gap-1">
                        {verse.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Studies */}
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
                            {verse.studies.map((study, idx) => {
                              // Remove verse references like "1:1", "12:5-7", "(v. 3)", "(vv. 1-5)"
                              const cleanedStudy = study
                                .replace(/\b\d+:\d+(-\d+)?\b/g, '')
                                .replace(/\(v+\.\s*\d+(-\d+)?\)/gi, '')
                                .replace(/\s{2,}/g, ' ')
                                .trim();
                              
                              if (!cleanedStudy) return null;
                              
                              return (
                                <div key={idx} className="p-3 bg-muted/50 rounded-lg border-l-2 border-primary/30">
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{cleanedStudy}</p>
                                </div>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks" className="mt-4">
          <ScrollArea className="h-[500px]">
            {bookmarks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum versículo favoritado ainda.</p>
                <p className="text-sm">Clique no ícone de favorito em qualquer versículo.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarks.map(bookmark => (
                  <div
                    key={bookmark.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedBook(bookmark.book_abbrev);
                      setSelectedChapterNum(bookmark.chapter);
                      setSelectedTestament(getTestament(bookmark.book_abbrev));
                      setActiveTab('read');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        {getBookName(bookmark.book_abbrev)} {bookmark.chapter}:{bookmark.verse}
                      </span>
                      <Bookmark className="h-4 w-4 fill-primary text-primary" />
                    </div>
                    {bookmark.verse_text && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {bookmark.verse_text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Table of Contents Tab */}
        <TabsContent value="toc" className="mt-4">
          <ScrollArea className="h-[500px]">
            {tableOfContents && tableOfContents.length > 0 ? (
              <div className="space-y-1">
                {tableOfContents.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 border-b hover:bg-muted/50 cursor-pointer flex items-center justify-between"
                  >
                    <span className="font-medium">{item.item}</span>
                    <span className="text-sm text-muted-foreground">Pág. {item.page}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <List className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Índice não disponível.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
