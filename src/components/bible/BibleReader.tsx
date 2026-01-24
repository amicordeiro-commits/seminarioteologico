import { useState, useEffect, useMemo } from 'react';
import { useBibleTranslations, AVAILABLE_TRANSLATIONS } from '@/hooks/useBibleTranslations';
import { useBibleBookmarks } from '@/hooks/useBibleBookmarks';
import { useBibleNotes } from '@/hooks/useBibleNotes';
import { useBibleSermons } from '@/hooks/useBibleSermons';
import { getBookName, getTestament, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '@/lib/bibleTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  Type, Tag, X, Check, Languages, BookText, Download
} from 'lucide-react';
import { toast } from 'sonner';

// Mostrar estudo original completo sem filtros

export function BibleReader() {
  const { 
    loading, 
    error, 
    books, 
    getChapter, 
    searchBible, 
    loadBook, 
    currentTranslation, 
    loadTranslation, 
    availableTranslations,
    dataLoaded 
  } = useBibleTranslations();
  const { bookmarks, isBookmarked, toggleBookmark } = useBibleBookmarks();
  const { notes, saveNote, getNoteForVerse } = useBibleNotes();
  const { sermons, loading: sermonsLoading, searchSermons } = useBibleSermons();
  const [sermonSearch, setSermonSearch] = useState('');
  const [selectedSermon, setSelectedSermon] = useState<number | null>(null);
  
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
  const [bookLoading, setBookLoading] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(true);

  // Load default translation on mount
  useEffect(() => {
    setTranslationLoading(true);
    loadTranslation('ACF').finally(() => setTranslationLoading(false));
  }, [loadTranslation]);

  // Load book when selected book or translation changes
  useEffect(() => {
    if (!dataLoaded) return;
    setBookLoading(true);
    loadBook(selectedBook).finally(() => setBookLoading(false));
  }, [selectedBook, loadBook, dataLoaded, currentTranslation]);

  const handleTranslationChange = async (translationId: string) => {
    setTranslationLoading(true);
    await loadTranslation(translationId);
    setTranslationLoading(false);
    setBookLoading(true);
    await loadBook(selectedBook);
    setBookLoading(false);
    toast.success(`Tradução alterada para ${AVAILABLE_TRANSLATIONS.find(t => t.id === translationId)?.shortName}`);
  };

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
    const match = goToRef.match(/^(\d?\s*\w+)\s*(\d+):?(\d+)?$/i);
    if (!match) {
      toast.error('Formato inválido. Use: Livro Capítulo:Versículo');
      return;
    }

    const bookInput = match[1].toLowerCase().trim();
    const chapterNum = parseInt(match[2]);
    
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

  if (loading || bookLoading || translationLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando Bíblia de Estudo...</span>
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
    <div className="space-y-3 sm:space-y-4">
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="read" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
            <Book className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Leitura</span>
          </TabsTrigger>
          <TabsTrigger value="estudos" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Estudos</span>
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
            <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Favoritos</span>
            <span className="text-[10px] sm:text-xs">({bookmarks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="toc" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3">
            <BookText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Traduções</span>
          </TabsTrigger>
        </TabsList>

        {/* Reading Tab */}
        <TabsContent value="read" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          {/* Testament Tabs */}
          <Tabs value={selectedTestament} onValueChange={(v) => handleTestamentChange(v as 'old' | 'new')}>
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="old" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Antigo</span> <span className="sm:hidden">AT</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                <Book className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Novo</span> <span className="sm:hidden">NT</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Controls Row 1: Translation, Book, Chapter, Settings */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
            {/* Translation Selector */}
            <Select 
              value={currentTranslation} 
              onValueChange={handleTranslationChange}
            >
              <SelectTrigger className="w-[70px] sm:w-[100px] h-8 sm:h-10 text-xs sm:text-sm">
                <BookText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                <SelectValue placeholder="Tradução" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {availableTranslations.map(translation => (
                  <SelectItem key={translation.id} value={translation.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{translation.shortName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedBook} 
              onValueChange={(v) => { 
                setSelectedBook(v); 
                setSelectedChapterNum(1); 
                setExpandedStudies(new Set());
                setSelectedTag(null);
              }}
            >
              <SelectTrigger className="w-[100px] sm:w-[160px] h-8 sm:h-10 text-xs sm:text-sm">
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
              <SelectTrigger className="w-[70px] sm:w-[120px] h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Cap." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Array.from({ length: totalChapters }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    <span className="hidden sm:inline">Cap.</span> {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Interlinear Mode Toggle - Visible Button */}
            <Button 
              variant={interlinearMode ? "default" : "outline"}
              size="sm"
              onClick={() => setInterlinearMode(!interlinearMode)}
              className="gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Strong&apos;s</span>
            </Button>

            {/* Settings Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" title="Configurações" className="h-8 w-8 sm:h-10 sm:w-10">
                  <Settings2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 sm:w-72">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Configurações de Leitura</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <Label className="text-xs sm:text-sm">Tamanho da fonte: {fontSize}px</Label>
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
                      <Label className="text-xs sm:text-sm">Modo Estudo</Label>
                    </div>
                    <Switch checked={studyMode} onCheckedChange={setStudyMode} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      <Label className="text-xs sm:text-sm">Modo Interlinear</Label>
                    </div>
                    <Switch checked={interlinearMode} onCheckedChange={setInterlinearMode} />
                  </div>
                  <div className="pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 text-xs"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = '/bible/strongs-portuguese-full.json';
                        link.download = 'strongs-portuguese-completo.json';
                        link.click();
                        toast.success('Download iniciado: Léxico Strong\'s Completo (14.540 entradas)');
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Baixar Léxico Strong's Completo
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">
                      14.540 entradas em Português (JSON)
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Controls Row 2: Go to reference */}
          <div className="flex gap-1.5 sm:gap-2">
            <Input
              value={goToRef}
              onChange={e => setGoToRef(e.target.value)}
              placeholder="Ir para... (ex: João 3:16)"
              className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
              onKeyDown={e => e.key === 'Enter' && handleGoToReference()}
            />
            <Button variant="secondary" size="icon" onClick={handleGoToReference} className="h-8 w-8 sm:h-10 sm:w-10">
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Controls Row 3: Search */}
          <div className="flex gap-1.5 sm:gap-2">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar na Bíblia..."
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            />
            <Button onClick={handleSearch} disabled={isSearching} size="sm" className="h-8 sm:h-10 px-2 sm:px-3">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-lg p-3 sm:p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm sm:text-base">Resultados ({searchResults.length})</h4>
                <Button variant="ghost" size="sm" onClick={() => setSearchResults([])} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
              <ScrollArea className="h-[120px] sm:h-[150px]">
                <div className="space-y-2">
                  {searchResults.map((result, idx) => (
                    <div
                      key={idx}
                      className="p-2 hover:bg-muted rounded cursor-pointer text-xs sm:text-sm"
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
            <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
              <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Badge 
                variant={selectedTag === null ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedTag(null)}
              >
                Todos
              </Badge>
              {chapterTags.map(tag => (
                <Badge 
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Chapter Navigation */}
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-2 sm:p-3">
            <Button variant="ghost" size="sm" onClick={goToPreviousChapter} className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" /> 
              <span className="hidden xs:inline">Anterior</span>
            </Button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {selectedTestament === 'old' ? 'AT' : 'NT'}
              </span>
              <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-lg font-semibold">
                <Book className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="truncate max-w-[100px] sm:max-w-none">{getBookName(selectedBook)}</span> {selectedChapterNum}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={goToNextChapter} className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
              <span className="hidden xs:inline">Próximo</span> 
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-0.5 sm:ml-1" />
            </Button>
          </div>

          {/* Verses - Interlinear or Regular Mode */}
          <ScrollArea className="h-[350px] sm:h-[450px] border rounded-lg p-2 sm:p-4">
            {interlinearMode ? (
              <InterlinearChapter
                bookAbbrev={selectedBook}
                chapter={selectedChapterNum}
                verses={filteredVerses}
                fontSize={fontSize}
              />
            ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredVerses.map((verse) => {
                const verseNote = getNoteForVerse(verse.id);
                const isVerseBookmarked = isBookmarked(verse.id);

                return (
                  <div key={verse.id} className="space-y-1 group">
                    <div className="flex items-start gap-1 sm:gap-2">
                      <p 
                        className="flex-1 leading-relaxed p-1.5 sm:p-2 hover:bg-muted rounded transition-colors text-sm sm:text-base"
                        style={{ fontSize: `${Math.max(fontSize - 2, 12)}px` }}
                      >
                        <span className="text-primary font-bold text-[10px] sm:text-sm mr-1 sm:mr-2 bg-primary/10 px-1 sm:px-1.5 py-0.5 rounded">
                          {verse.verse_number}
                        </span>
                        {verse.text}
                      </p>
                      
                      {/* Verse Actions */}
                      <div className="flex gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => toggleBookmark({
                            verse_id: verse.id,
                            book_abbrev: selectedBook,
                            chapter: selectedChapterNum,
                            verse: verse.verse_number,
                            verse_text: verse.text,
                          })}
                        >
                          <Bookmark className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isVerseBookmarked ? 'fill-primary text-primary' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 hidden xs:flex"
                          onClick={() => copyVerse(verse)}
                        >
                          <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => {
                                setEditingNote(verse.id);
                                setNoteText(verseNote?.note || '');
                              }}
                            >
                              <PenLine className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${verseNote ? 'text-primary' : ''}`} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 sm:w-80">
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">Nota pessoal</Label>
                              <Textarea
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                placeholder="Escreva sua nota..."
                                rows={3}
                                className="text-xs sm:text-sm"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveNote(verse.id, selectedBook, selectedChapterNum, verse.verse_number)}
                                  className="text-xs sm:text-sm h-7 sm:h-8"
                                >
                                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Salvar
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Personal Note Display */}
                    {verseNote && (
                      <div className="ml-4 sm:ml-8 p-1.5 sm:p-2 bg-primary/5 rounded border-l-2 border-primary text-xs sm:text-sm">
                        <span className="font-medium text-primary">Sua nota:</span> {verseNote.note}
                      </div>
                    )}

                    {/* Tags */}
                    {verse.tags && verse.tags.length > 0 && (
                      <div className="ml-4 sm:ml-8 flex gap-1">
                        {verse.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] sm:text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks" className="mt-3 sm:mt-4">
          <ScrollArea className="h-[350px] sm:h-[500px]">
            {bookmarks.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Bookmark className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">Nenhum versículo favoritado ainda.</p>
                <p className="text-xs sm:text-sm">Clique no ícone de favorito em qualquer versículo.</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {bookmarks.map(bookmark => (
                  <div
                    key={bookmark.id}
                    className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedBook(bookmark.book_abbrev);
                      setSelectedChapterNum(bookmark.chapter);
                      setSelectedTestament(getTestament(bookmark.book_abbrev));
                      setActiveTab('read');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary text-sm sm:text-base">
                        {getBookName(bookmark.book_abbrev)} {bookmark.chapter}:{bookmark.verse}
                      </span>
                      <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-primary text-primary" />
                    </div>
                    {bookmark.verse_text && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {bookmark.verse_text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Estudos Tab - Sermons */}
        <TabsContent value="estudos" className="mt-3 sm:mt-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-1.5 sm:gap-2">
              <Input
                value={sermonSearch}
                onChange={e => setSermonSearch(e.target.value)}
                placeholder="Buscar estudos e sermões..."
                className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
              />
              <Button variant="secondary" onClick={() => setSermonSearch('')} size="sm" className="h-8 sm:h-10 px-2 sm:px-3">
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
            
            {selectedSermon !== null ? (
              <div className="space-y-3 sm:space-y-4">
                <Button variant="ghost" onClick={() => setSelectedSermon(null)} size="sm" className="text-xs sm:text-sm h-8">
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> Voltar para lista
                </Button>
                <ScrollArea className="h-[350px] sm:h-[450px] border rounded-lg p-3 sm:p-4">
                  {sermons[selectedSermon] && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="border-b pb-3 sm:pb-4">
                        <Badge variant="secondary" className="mb-2 text-xs">
                          {sermons[selectedSermon].ReferenciaBiblica}
                        </Badge>
                        <h2 className="text-lg sm:text-xl font-bold">{sermons[selectedSermon].Titulo}</h2>
                      </div>
                      <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-foreground text-xs sm:text-sm">
                        {sermons[selectedSermon].Texto}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>
            ) : (
              <ScrollArea className="h-[350px] sm:h-[450px]">
                {sermonsLoading ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                    <span className="ml-2 text-sm">Carregando estudos...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(sermonSearch ? searchSermons(sermonSearch) : sermons).map((sermon, idx) => (
                      <div
                        key={idx}
                        className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedSermon(sermons.indexOf(sermon))}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <Badge variant="outline" className="mb-1 text-[10px] sm:text-xs">
                              {sermon.ReferenciaBiblica}
                            </Badge>
                            <h3 className="font-semibold line-clamp-1 text-sm sm:text-base">{sermon.Titulo}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                              {sermon.Texto.substring(0, 150)}...
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                    {(sermonSearch ? searchSermons(sermonSearch) : sermons).length === 0 && (
                      <div className="text-center py-6 sm:py-8 text-muted-foreground">
                        <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum estudo encontrado.</p>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        {/* Table of Contents Tab - Translations */}
        <TabsContent value="toc" className="mt-3 sm:mt-4">
          <ScrollArea className="h-[350px] sm:h-[500px]">
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Traduções Disponíveis</h3>
              {availableTranslations.map((translation) => (
                <div
                  key={translation.id}
                  className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                    currentTranslation === translation.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleTranslationChange(translation.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <BookText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="font-semibold text-sm sm:text-base">{translation.shortName}</span>
                      <span className="text-muted-foreground hidden xs:inline">-</span>
                      <span className="text-xs sm:text-sm hidden xs:inline">{translation.name}</span>
                    </div>
                    {currentTranslation === translation.id && (
                      <Badge variant="default" className="text-xs">Atual</Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{translation.description}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
