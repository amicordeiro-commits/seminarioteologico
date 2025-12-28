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

// Book-specific keywords that should ONLY appear in those books
const BOOK_EXCLUSIVE_KEYWORDS: Record<string, string[]> = {
  // Pentateuco
  'gn': ['criação', 'adão', 'eva', 'éden', 'caim', 'abel', 'noé', 'dilúvio', 'babel', 'abraão', 'isaque', 'jacó', 'josé do egito'],
  'ex': ['faraó', 'pragas', 'moisés menino', 'sarça ardente', 'páscoa', 'travessia do mar', 'maná', 'sinai', 'tabernáculo', 'êxodo'],
  'lv': ['sacrifício', 'holocausto', 'oferta', 'sacerdote', 'levita', 'purificação', 'impuro', 'lepra'],
  'nm': ['censo', 'recenseamento', 'deserto', 'peregrinação', 'balaão'],
  'dt': ['segunda lei', 'recapitulação'],
  
  // Históricos
  'js': ['jericó', 'conquista de canaã', 'josué'],
  'jz': ['juízes de israel', 'gideão', 'sansão', 'débora'],
  'rt': ['rute', 'noemi', 'boaz', 'moabita'],
  '1sm': ['samuel', 'saul rei', 'davi jovem', 'golias'],
  '2sm': ['davi rei', 'bate-seba', 'absalão'],
  '1rs': ['salomão', 'templo de salomão', 'elias'],
  '2rs': ['eliseu', 'queda de israel', 'cativeiro'],
  
  // Poéticos
  'sl': ['salmo', 'louvai', 'senhor é meu pastor'],
  'pv': ['provérbio', 'sabedoria', 'tolo', 'prudente'],
  'ec': ['vaidade', 'debaixo do sol', 'pregador'],
  'ct': ['amada', 'amado', 'sulamita'],
  'jó': ['jó', 'satanás', 'sofrimento de jó'],
  
  // Profetas Maiores
  'is': ['isaías profeta', 'emanuel', 'servo sofredor'],
  'jr': ['jeremias profeta', 'lamentações de jeremias'],
  'lm': ['lamentação', 'jerusalém destruída'],
  'ez': ['ezequiel', 'visão do vale', 'ossos secos'],
  'dn': ['daniel', 'nabucodonosor', 'cova dos leões', 'sonho de daniel'],
  
  // Profetas Menores
  'os': ['oséias', 'gômer'],
  'jl': ['joel profeta', 'gafanhotos'],
  'am': ['amós profeta', 'pastor de tecoa'],
  'ob': ['obadias', 'edom'],
  'jn': ['jonas', 'nínive', 'grande peixe'],
  'mq': ['miquéias profeta'],
  'na': ['naum', 'queda de nínive'],
  'hc': ['habacuque'],
  'sf': ['sofonias'],
  'ag': ['ageu', 'reconstrução do templo'],
  'zc': ['zacarias profeta'],
  'ml': ['malaquias', 'dízimos e ofertas'],
  
  // Evangelhos
  'mt': ['mateus', 'sermão do monte', 'genealogia de jesus'],
  'mc': ['marcos evangelista'],
  'lc': ['lucas', 'bom samaritano', 'filho pródigo'],
  'joao': ['joão evangelista', 'verbo se fez carne', 'lázaro ressuscitado'],
  
  // Atos e Cartas
  'at': ['pentecostes', 'paulo convertido', 'viagens missionárias'],
  'rm': ['romanos', 'justificação pela fé'],
  '1co': ['coríntios', 'dons espirituais', 'corpo de cristo'],
  '2co': ['coríntios'],
  'gl': ['gálatas', 'lei e graça'],
  'ef': ['efésios', 'armadura de deus'],
  'fp': ['filipenses', 'alegria'],
  'cl': ['colossenses'],
  '1ts': ['tessalonicenses', 'volta de cristo'],
  '2ts': ['tessalonicenses'],
  '1tm': ['timóteo'],
  '2tm': ['timóteo'],
  'tt': ['tito'],
  'fm': ['filemom', 'onésimo'],
  'hb': ['hebreus', 'melquisedeque', 'herois da fé'],
  'tg': ['tiago', 'fé e obras'],
  '1pe': ['pedro'],
  '2pe': ['pedro'],
  '1jo': ['anticristo'],
  '2jo': [],
  '3jo': [],
  'jd': ['judas'],
  'ap': ['apocalipse', 'revelação', 'sete igrejas', 'dragão', 'besta', 'nova jerusalém'],
};

// Keywords that indicate Exodus content (common misplacement)
const EXODUS_INDICATORS = [
  'faraó', 'parteiras', 'escravos do egito', 'pitom', 'ramessés', 'moisés arão',
  'pragas do egito', 'primogênitos', 'travessia do mar vermelho', 'êxodo dos hebreus'
];

// Keywords for NT that shouldn't appear in OT books
const NT_ONLY_KEYWORDS = [
  'jesus cristo', 'crucificação', 'ressurreição de jesus', 'igreja primitiva',
  'apóstolo paulo', 'evangelho de', 'carta aos'
];

// Check if comment is corrupted/garbled
function isCorruptedText(comment: string): boolean {
  // Too many special characters
  const weirdChars = (comment.match(/[­\/\^\|<>«»°§]/g) || []).length;
  if (weirdChars > 5) return true;
  
  // Too many broken words (OCR artifacts)
  const brokenWords = (comment.match(/[a-záéíóúãõâêô]\s{1,2}[a-záéíóúãõâêô]/gi) || []).length;
  if (brokenWords > 10) return true;
  
  // Mostly reference numbers (not actual content)
  const refPattern = /^[\d\s:;,.\-a-zA-Z]+$/;
  if (refPattern.test(comment) && comment.length < 200) {
    const wordCount = comment.split(/\s+/).filter(w => w.length > 4).length;
    if (wordCount < 5) return true;
  }
  
  // Starts with random fragments
  if (comment.match(/^[,.:;)\]]/)) return true;
  
  return false;
}

// Get the book category for context-based filtering
function getBookCategory(abbrev: string): string {
  const pentateuch = ['gn', 'ex', 'lv', 'nm', 'dt'];
  const historical = ['js', 'jz', 'rt', '1sm', '2sm', '1rs', '2rs', '1cr', '2cr', 'ed', 'ne', 'et'];
  const poetic = ['jo', 'sl', 'pv', 'ec', 'ct'];
  const majorProphets = ['is', 'jr', 'lm', 'ez', 'dn'];
  const minorProphets = ['os', 'jl', 'am', 'ob', 'jn', 'mq', 'na', 'hc', 'sf', 'ag', 'zc', 'ml'];
  const gospels = ['mt', 'mc', 'lc', 'jo'];
  const acts = ['at'];
  const pauline = ['rm', '1co', '2co', 'gl', 'ef', 'fp', 'cl', '1ts', '2ts', '1tm', '2tm', 'tt', 'fm'];
  const general = ['hb', 'tg', '1pe', '2pe', '1jo', '2jo', '3jo', 'jd'];
  const apocalyptic = ['ap'];
  
  if (pentateuch.includes(abbrev)) return 'pentateuch';
  if (historical.includes(abbrev)) return 'historical';
  if (poetic.includes(abbrev)) return 'poetic';
  if (majorProphets.includes(abbrev)) return 'majorProphets';
  if (minorProphets.includes(abbrev)) return 'minorProphets';
  if (gospels.includes(abbrev)) return 'gospels';
  if (acts.includes(abbrev)) return 'acts';
  if (pauline.includes(abbrev)) return 'pauline';
  if (general.includes(abbrev)) return 'general';
  if (apocalyptic.includes(abbrev)) return 'apocalyptic';
  return 'unknown';
}

// Check if comment likely belongs to a different book
function detectMisplacedContent(bookAbbrev: string, chapter: number, comment: string): boolean {
  const lowerComment = comment.toLowerCase();
  const category = getBookCategory(bookAbbrev);
  
  // Check for Exodus content in non-Exodus books
  if (bookAbbrev !== 'ex') {
    const hasExodusIndicators = EXODUS_INDICATORS.some(kw => lowerComment.includes(kw));
    if (hasExodusIndicators) {
      // Allow if it's a cross-reference context
      if (!lowerComment.includes('ver êx') && !lowerComment.includes('êxodo') && !lowerComment.includes('ex ')) {
        return true;
      }
    }
  }
  
  // Check for NT content in OT books
  const isOT = ['pentateuch', 'historical', 'poetic', 'majorProphets', 'minorProphets'].includes(category);
  if (isOT) {
    const hasNTContent = NT_ONLY_KEYWORDS.some(kw => lowerComment.includes(kw));
    if (hasNTContent && !lowerComment.includes('profecia') && !lowerComment.includes('cumprimento')) {
      return true;
    }
  }
  
  // Check for specific book content in wrong books
  for (const [otherBook, keywords] of Object.entries(BOOK_EXCLUSIVE_KEYWORDS)) {
    if (otherBook === bookAbbrev) continue;
    
    // Check if comment has exclusive keywords from another book
    const matchCount = keywords.filter(kw => lowerComment.includes(kw)).length;
    
    // If 2+ exclusive keywords from another book, likely misplaced
    if (matchCount >= 2) {
      // Check if our book also has matching keywords
      const ourKeywords = BOOK_EXCLUSIVE_KEYWORDS[bookAbbrev] || [];
      const ourMatchCount = ourKeywords.filter(kw => lowerComment.includes(kw)).length;
      
      if (matchCount > ourMatchCount) {
        return true;
      }
    }
  }
  
  // Special case: Genesis chapters 1-11 (primordial history)
  if (bookAbbrev === 'gn' && chapter <= 11) {
    const exodusContent = ['escravos', 'faraó ordenou', 'parteiras', 'pitom', 'hebreus no egito'];
    if (exodusContent.some(kw => lowerComment.includes(kw))) {
      return true;
    }
  }
  
  return false;
}

// Main validation function
function isValidCommentForBook(bookName: string, bookAbbrev: string, chapter: number, comment: string): boolean {
  // Filter corrupted text
  if (isCorruptedText(comment)) {
    return false;
  }
  
  // Minimum length check
  if (comment.trim().length < 30) {
    return false;
  }
  
  // Filter misplaced content
  if (detectMisplacedContent(bookAbbrev, chapter, comment)) {
    return false;
  }
  
  return true;
}

// Index type for fast lookups
type CommentsIndex = Map<string, string[]>;

let studyBibleData: StudyBibleData | null = null;
let commentsIndex: CommentsIndex | null = null;
let isLoading = false;

function buildIndex(data: StudyBibleData): CommentsIndex {
  const index: CommentsIndex = new Map();
  let filteredCount = 0;
  let totalCount = 0;
  
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
        totalCount++;
        if (!estudo.comentario) continue;
        
        // Validate comment belongs to this book
        if (!isValidCommentForBook(bookName, abbrev, estudo.capitulo, estudo.comentario)) {
          filteredCount++;
          continue;
        }
        
        const key = `${abbrev}_${estudo.capitulo}_${estudo.versiculo}`;
        const existing = index.get(key) || [];
        existing.push(estudo.comentario.trim());
        index.set(key, existing);
      }
    }
  }
  
  console.log(`📚 Study comments: ${index.size} entries loaded, ${filteredCount}/${totalCount} filtered out`);
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
