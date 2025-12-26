import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BibleReader } from '@/components/bible/BibleReader';
import { BookOpen } from 'lucide-react';

export default function BiblePage() {
  useEffect(() => {
    document.title = 'Bíblia de Estudo ESV | Seminário Teológico';
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bíblia de Estudo ESV</h1>
            <p className="text-muted-foreground">
              Leia e estude as Escrituras com comentários teológicos
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <BibleReader />
        </div>
      </div>
    </AppLayout>
  );
}
