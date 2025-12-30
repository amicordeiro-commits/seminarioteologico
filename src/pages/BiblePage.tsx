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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold truncate">Bíblia de Estudo ESV</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Leia e estude as Escrituras com comentários teológicos
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-3 sm:p-6">
          <BibleReader />
        </div>
      </div>
    </AppLayout>
  );
}
