import { useState, useEffect, useCallback } from 'react';

export interface BibleSermon {
  ReferenciaBiblica: string;
  Titulo: string;
  Texto: string;
  Pagina: number;
}

let sermonsData: BibleSermon[] | null = null;

export function useBibleSermons() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sermons, setSermons] = useState<BibleSermon[]>([]);

  useEffect(() => {
    if (sermonsData) {
      setSermons(sermonsData);
      setLoaded(true);
      setLoading(false);
      return;
    }

    fetch('/bible/estudos-biblicos.json')
      .then(res => res.json())
      .then((data: BibleSermon[]) => {
        sermonsData = data;
        setSermons(data);
        setLoaded(true);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load Bible sermons:', err);
        setError('Falha ao carregar sermões');
        setLoading(false);
      });
  }, []);

  const searchSermons = useCallback((query: string): BibleSermon[] => {
    if (!sermonsData || !query.trim()) return sermonsData || [];
    
    const lowerQuery = query.toLowerCase();
    return sermonsData.filter(sermon => 
      sermon.Titulo.toLowerCase().includes(lowerQuery) ||
      sermon.Texto.toLowerCase().includes(lowerQuery) ||
      sermon.ReferenciaBiblica.toLowerCase().includes(lowerQuery)
    );
  }, []);

  return {
    loading,
    error,
    loaded,
    sermons,
    searchSermons,
  };
}
