import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BibleReader } from '@/components/bible/BibleReader';
import { BibleChat } from '@/components/bible/BibleChat';
import { BibleStudyPanel } from '@/components/bible/BibleStudyPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, MessageCircle, BookOpen, GraduationCap } from 'lucide-react';

export default function BiblePage() {
  const [verseContext, setVerseContext] = useState<string>('');
  const [currentBook, setCurrentBook] = useState<string>('gn');
  const [currentChapter, setCurrentChapter] = useState<number>(1);

  useEffect(() => {
    document.title = 'Bíblia Tefilin | Seminário Teológico';
  }, []);

  const handleContextChange = (context: string) => {
    setVerseContext(context);
    // Extract book and chapter from context
    const match = context.match(/^(\w+(?:\s\w+)?)\s+(\d+):/);
    if (match) {
      // We'll let BibleReader handle this via a callback
    }
  };

  const handleBookChapterChange = (book: string, chapter: number) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bíblia Tefilin</h1>
            <p className="text-muted-foreground">
              Leia, estude e tire suas dúvidas com a assistência de IA
            </p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-lg border p-6">
            <Tabs defaultValue="read" className="h-full">
              <TabsList className="mb-4">
                <TabsTrigger value="read" className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Leitura
                </TabsTrigger>
                <TabsTrigger value="study" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Estudos
                </TabsTrigger>
              </TabsList>
              <TabsContent value="read" className="mt-0">
                <BibleReader 
                  onContextChange={handleContextChange} 
                  onBookChapterChange={handleBookChapterChange}
                />
              </TabsContent>
              <TabsContent value="study" className="mt-0 h-[500px]">
                <BibleStudyPanel bookAbbrev={currentBook} chapter={currentChapter} />
              </TabsContent>
            </Tabs>
          </div>
          <div className="h-[calc(100vh-200px)]">
            <BibleChat verseContext={verseContext} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <Tabs defaultValue="read" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="read" className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                Leitura
              </TabsTrigger>
              <TabsTrigger value="study" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Estudos
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                IA
              </TabsTrigger>
            </TabsList>
            <TabsContent value="read" className="mt-4">
              <div className="bg-card rounded-lg border p-4">
                <BibleReader 
                  onContextChange={handleContextChange}
                  onBookChapterChange={handleBookChapterChange}
                />
              </div>
            </TabsContent>
            <TabsContent value="study" className="mt-4">
              <div className="bg-card rounded-lg border p-4 h-[70vh]">
                <BibleStudyPanel bookAbbrev={currentBook} chapter={currentChapter} />
              </div>
            </TabsContent>
            <TabsContent value="chat" className="mt-4 h-[70vh]">
              <BibleChat verseContext={verseContext} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
