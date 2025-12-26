import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StrongsEntry {
  Gk_word?: string;
  Hb_word?: string;
  transliteration: string;
  strongs_def: string;
  part_of_speech: string;
  root_word: string;
  occurrences: string;
  outline_usage: string;
}

interface StrongsLexicon {
  [key: string]: StrongsEntry;
}

interface TranslationStats {
  total: number;
  translated: number;
  pending: number;
  percentage: number;
}

interface Translation {
  strongs_id: string;
  original_word: string | null;
  portuguese_word: string;
  portuguese_definition: string;
  portuguese_usage: string | null;
  transliteration: string | null;
  part_of_speech: string | null;
}

export function useStrongsTranslation() {
  const [lexicon, setLexicon] = useState<StrongsLexicon | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [stats, setStats] = useState<TranslationStats>({ total: 0, translated: 0, pending: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Load lexicon and existing translations
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load lexicon
      const lexResponse = await fetch('/bible/strongs-lexicon.json');
      const lexData: StrongsLexicon = await lexResponse.json();
      setLexicon(lexData);

      // Load existing translations from database
      const { data: dbTranslations, error } = await supabase
        .from('strongs_translations')
        .select('*');

      if (error) throw error;

      setTranslations(dbTranslations || []);

      // Calculate stats
      const total = Object.keys(lexData).length;
      const translated = dbTranslations?.length || 0;
      setStats({
        total,
        translated,
        pending: total - translated,
        percentage: Math.round((translated / total) * 100)
      });

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do léxico',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const translateBatch = async (batchSize: number = 50) => {
    if (!lexicon || isTranslating) return;

    setIsTranslating(true);
    setProgress(0);

    try {
      const translatedIds = new Set(translations.map(t => t.strongs_id));
      const pendingEntries = Object.entries(lexicon)
        .filter(([id]) => !translatedIds.has(id))
        .slice(0, batchSize)
        .map(([id, entry]) => ({ id, entry }));

      if (pendingEntries.length === 0) {
        toast({
          title: 'Completo!',
          description: 'Todas as traduções já foram feitas.',
        });
        setIsTranslating(false);
        return;
      }

      // Process in chunks of 10
      const chunkSize = 10;
      let processed = 0;

      for (let i = 0; i < pendingEntries.length; i += chunkSize) {
        const chunk = pendingEntries.slice(i, i + chunkSize);
        
        const { data, error } = await supabase.functions.invoke('translate-strongs-batch', {
          body: { entries: chunk, batchSize: 5 }
        });

        if (error) {
          console.error('Translation error:', error);
          toast({
            title: 'Erro na tradução',
            description: error.message,
            variant: 'destructive'
          });
          break;
        }

        processed += data?.translated || 0;
        setProgress(Math.round((processed / pendingEntries.length) * 100));

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Reload data
      await loadData();

      toast({
        title: 'Lote concluído!',
        description: `${processed} traduções adicionadas.`,
      });

    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'Erro',
        description: 'Falha no processo de tradução',
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
      setProgress(0);
    }
  };

  const exportToJson = () => {
    const exportData: Record<string, { word: string; definition: string; usage: string }> = {};
    
    translations.forEach(t => {
      exportData[t.strongs_id] = {
        word: t.portuguese_word,
        definition: t.portuguese_definition,
        usage: t.portuguese_usage || ''
      };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'strongs-portuguese.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Exportado!',
      description: `${translations.length} traduções exportadas para JSON.`
    });
  };

  const importDictionary = async (dictionaryText: string) => {
    setIsTranslating(true);
    setProgress(0);

    try {
      const { data, error } = await supabase.functions.invoke('import-strongs-dictionary', {
        body: { dictionaryText }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: 'Importação concluída!',
          description: `${data.imported} traduções importadas com sucesso.`,
        });
        await loadData();
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }

      return data;
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Erro na importação',
        description: error instanceof Error ? error.message : 'Falha na importação',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsTranslating(false);
      setProgress(100);
    }
  };

  return {
    lexicon,
    translations,
    stats,
    isLoading,
    isTranslating,
    progress,
    translateBatch,
    exportToJson,
    importDictionary,
    refreshData: loadData
  };
}
