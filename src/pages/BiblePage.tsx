import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BibleReader } from '@/components/bible/BibleReader';
import { BibleChat } from '@/components/bible/BibleChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, MessageCircle, BookOpen } from 'lucide-react';

export default function BiblePage() {
  const [verseContext, setVerseContext] = useState<string>('');

  useEffect(() => {
    document.title = 'Estudo Bíblico | Escola Teológica';
  }, []);

  return (
    <AppLayout>
      

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Estudo Bíblico</h1>
            <p className="text-muted-foreground">
              Leia a Bíblia e tire suas dúvidas com a assistência de IA
            </p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Book className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Leitura</h2>
            </div>
            <BibleReader onContextChange={setVerseContext} />
          </div>
          <div className="h-[calc(100vh-200px)]">
            <BibleChat verseContext={verseContext} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <Tabs defaultValue="read" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="read" className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                Leitura
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Assistente
              </TabsTrigger>
            </TabsList>
            <TabsContent value="read" className="mt-4">
              <div className="bg-card rounded-lg border p-4">
                <BibleReader onContextChange={setVerseContext} />
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
