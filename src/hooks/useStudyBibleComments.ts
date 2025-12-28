import { useState, useEffect, useCallback } from 'react';

interface EstudoItem {
  referencia: string;
  capitulo: number;
  versiculo: number;
  comentario: string;
}

interface LivroData {
  introducao?: string;
  estudos: EstudoItem[];
}

interface TestamentoData {
  [livro: string]: LivroData;
}

interface StudyBibleData {
  titulo: string;
  versao: string;
  testamentos: {
    'Antigo Testamento': TestamentoData;
    'Novo Testamento'?: TestamentoData;
  };
}

// Map Portuguese book names to abbreviations
const BOOK_NAME_TO_ABBREV: Record<string, string> = {
  'gênesis': 'gn', 'genesis': 'gn',
  'êxodo': 'ex', 'exodo': 'ex',
  'levítico': 'lv', 'levitico': 'lv',
  'números': 'nm', 'numeros': 'nm',
  'deuteronômio': 'dt', 'deuteronomio': 'dt',
  'josué': 'js', 'josue': 'js',
  'juízes': 'jz', 'juizes': 'jz',
  'rute': 'rt',
  '1 samuel': '1sm', '1samuel': '1sm',
  '2 samuel': '2sm', '2samuel': '2sm',
  '1 reis': '1rs', '1reis': '1rs',
  '2 reis': '2rs', '2reis': '2rs',
  '1 crônicas': '1cr', '1cronicas': '1cr', '1 cronicas': '1cr',
  '2 crônicas': '2cr', '2cronicas': '2cr', '2 cronicas': '2cr',
  'esdras': 'ed',
  'neemias': 'ne',
  'ester': 'et',
  'jó': 'jo', 'jo': 'jo',
  'salmos': 'sl',
  'provérbios': 'pv', 'proverbios': 'pv',
  'eclesiastes': 'ec',
  'cânticos': 'ct', 'canticos': 'ct', 'cantares': 'ct', 'cântico dos cânticos': 'ct',
  'isaías': 'is', 'isaias': 'is',
  'jeremias': 'jr',
  'lamentações': 'lm', 'lamentacoes': 'lm',
  'ezequiel': 'ez',
  'daniel': 'dn',
  'oséias': 'os', 'oseias': 'os',
  'joel': 'jl',
  'amós': 'am', 'amos': 'am',
  'obadias': 'ob',
  'jonas': 'jn',
  'miquéias': 'mq', 'miqueias': 'mq',
  'naum': 'na',
  'habacuque': 'hc',
  'sofonias': 'sf',
  'ageu': 'ag',
  'zacarias': 'zc',
  'malaquias': 'ml',
  'mateus': 'mt',
  'marcos': 'mc',
  'lucas': 'lc',
  'joão': 'jo', 'joao': 'jo',
  'atos': 'at', 'atos dos apóstolos': 'at',
  'romanos': 'rm',
  '1 coríntios': '1co', '1corintios': '1co', '1 corintios': '1co',
  '2 coríntios': '2co', '2corintios': '2co', '2 corintios': '2co',
  'gálatas': 'gl', 'galatas': 'gl',
  'efésios': 'ef', 'efesios': 'ef',
  'filipenses': 'fp',
  'colossenses': 'cl',
  '1 tessalonicenses': '1ts', '1tessalonicenses': '1ts',
  '2 tessalonicenses': '2ts', '2tessalonicenses': '2ts',
  '1 timóteo': '1tm', '1timoteo': '1tm', '1 timoteo': '1tm',
  '2 timóteo': '2tm', '2timoteo': '2tm', '2 timoteo': '2tm',
  'tito': 'tt',
  'filemom': 'fm',
  'hebreus': 'hb',
  'tiago': 'tg',
  '1 pedro': '1pe', '1pedro': '1pe',
  '2 pedro': '2pe', '2pedro': '2pe',
  '1 joão': '1jo', '1joao': '1jo', '1 joao': '1jo',
  '2 joão': '2jo', '2joao': '2jo', '2 joao': '2jo',
  '3 joão': '3jo', '3joao': '3jo', '3 joao': '3jo',
  'judas': 'jd',
  'apocalipse': 'ap',
};

// Index type for fast lookups
type CommentsIndex = Map<string, string[]>;

let studyBibleData: StudyBibleData | null = null;
let commentsIndex: CommentsIndex | null = null;
let isLoading = false;

function buildIndex(data: StudyBibleData): CommentsIndex {
  const index: CommentsIndex = new Map();
  
  // Process both testaments
  const testamentos = data.testamentos;
  
  for (const testamento of Object.values(testamentos)) {
    if (!testamento) continue;
    
    for (const [bookName, bookData] of Object.entries(testamento)) {
      const abbrev = BOOK_NAME_TO_ABBREV[bookName.toLowerCase()];
      if (!abbrev) {
        console.warn(`Unknown book name: ${bookName}`);
        continue;
      }
      
      if (!bookData.estudos) continue;
      
      for (const estudo of bookData.estudos) {
        if (!estudo.comentario || estudo.comentario.trim().length < 20) continue;
        
        const key = `${abbrev}_${estudo.capitulo}_${estudo.versiculo}`;
        const existing = index.get(key) || [];
        existing.push(estudo.comentario.trim());
        index.set(key, existing);
      }
    }
  }
  
  console.log(`Built study comments index with ${index.size} entries from refined data`);
  return index;
}

export function useStudyBibleComments() {
  const [loading, setLoading] = useState(!commentsIndex);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(!!commentsIndex);

  useEffect(() => {
    if (commentsIndex) {
      setLoaded(true);
      setLoading(false);
      return;
    }

    if (isLoading) return;
    isLoading = true;

    fetch('/bible/estudos-refinados.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load study Bible');
        return res.json();
      })
      .then((data: StudyBibleData) => {
        studyBibleData = data;
        commentsIndex = buildIndex(data);
        setLoaded(true);
        setLoading(false);
        isLoading = false;
      })
      .catch(err => {
        console.error('Failed to load study Bible comments:', err);
        setError('Falha ao carregar comentários de estudo');
        setLoading(false);
        isLoading = false;
      });
  }, []);

  const getCommentsForVerse = useCallback((bookAbbrev: string, chapter: number, verse: number): string[] => {
    if (!commentsIndex) return [];
    
    const key = `${bookAbbrev.toLowerCase()}_${chapter}_${verse}`;
    return commentsIndex.get(key) || [];
  }, []);

  const hasCommentsForVerse = useCallback((bookAbbrev: string, chapter: number, verse: number): boolean => {
    if (!commentsIndex) return false;
    
    const key = `${bookAbbrev.toLowerCase()}_${chapter}_${verse}`;
    return commentsIndex.has(key);
  }, []);

  const getChapterCommentsCount = useCallback((bookAbbrev: string, chapter: number): number => {
    if (!commentsIndex) return 0;
    
    let count = 0;
    const prefix = `${bookAbbrev.toLowerCase()}_${chapter}_`;
    
    commentsIndex.forEach((_, key) => {
      if (key.startsWith(prefix)) count++;
    });
    
    return count;
  }, []);

  return {
    loading,
    error,
    loaded,
    getCommentsForVerse,
    hasCommentsForVerse,
    getChapterCommentsCount,
    metadata: studyBibleData ? { title: studyBibleData.titulo, version: studyBibleData.versao } : undefined,
  };
}
