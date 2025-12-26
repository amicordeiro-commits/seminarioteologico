import { useState, useEffect, useCallback } from 'react';

interface StudyEntry {
  b: string; // Book name in Portuguese
  c: number; // Chapter
  v: string; // Verse (as string)
  t: string; // Study text
}

// Mapping from Portuguese book names to abbreviations
const BOOK_NAME_TO_ABBREV: Record<string, string> = {
  'GÊNESIS': 'gen', 'GENESIS': 'gen',
  'ÊXODO': 'exo', 'EXODO': 'exo',
  'LEVÍTICO': 'lev', 'LEVITICO': 'lev',
  'NÚMEROS': 'num', 'NUMEROS': 'num',
  'DEUTERONÔMIO': 'deu', 'DEUTERONOMIO': 'deu',
  'JOSUÉ': 'jos', 'JOSUE': 'jos',
  'JUÍZES': 'jdg', 'JUIZES': 'jdg',
  'RUTE': 'rth',
  'I SAMUEL': '1sa', '1 SAMUEL': '1sa',
  'II SAMUEL': '2sa', '2 SAMUEL': '2sa',
  'I REIS': '1ki', '1 REIS': '1ki',
  'II REIS': '2ki', '2 REIS': '2ki',
  'I CRÔNICAS': '1ch', '1 CRÔNICAS': '1ch', 'I CRONICAS': '1ch', '1 CRONICAS': '1ch',
  'II CRÔNICAS': '2ch', '2 CRÔNICAS': '2ch', 'II CRONICAS': '2ch', '2 CRONICAS': '2ch',
  'ESDRAS': 'ezr',
  'NEEMIAS': 'neh',
  'ESTER': 'est',
  'JÓ': 'job', 'JO': 'job',
  'SALMOS': 'psa',
  'PROVÉRBIOS': 'pro', 'PROVERBIOS': 'pro',
  'ECLESIASTES': 'ecc',
  'CANTARES': 'sng', 'CÂNTICOS': 'sng', 'CANTICOS': 'sng',
  'ISAÍAS': 'isa', 'ISAIAS': 'isa',
  'JEREMIAS': 'jer',
  'LAMENTAÇÕES': 'lam', 'LAMENTACOES': 'lam',
  'EZEQUIEL': 'eze',
  'DANIEL': 'dan',
  'OSÉIAS': 'hos', 'OSEIAS': 'hos',
  'JOEL': 'joe',
  'AMÓS': 'amo', 'AMOS': 'amo',
  'OBADIAS': 'oba',
  'JONAS': 'jon',
  'MIQUÉIAS': 'mic', 'MIQUEIAS': 'mic',
  'NAUM': 'nah',
  'HABACUQUE': 'hab',
  'SOFONIAS': 'zep',
  'AGEU': 'hag',
  'ZACARIAS': 'zec',
  'MALAQUIAS': 'mal',
  'MATEUS': 'mat',
  'MARCOS': 'mar',
  'LUCAS': 'luk',
  'JOÃO': 'jhn', 'JOAO': 'jhn',
  'ATOS': 'act',
  'ROMANOS': 'rom',
  'I CORÍNTIOS': '1co', '1 CORÍNTIOS': '1co', 'I CORINTIOS': '1co', '1 CORINTIOS': '1co',
  'II CORÍNTIOS': '2co', '2 CORÍNTIOS': '2co', 'II CORINTIOS': '2co', '2 CORINTIOS': '2co',
  'GÁLATAS': 'gal', 'GALATAS': 'gal',
  'EFÉSIOS': 'eph', 'EFESIOS': 'eph',
  'FILIPENSES': 'phl',
  'COLOSSENSES': 'col',
  'I TESSALONICENSES': '1th', '1 TESSALONICENSES': '1th',
  'II TESSALONICENSES': '2th', '2 TESSALONICENSES': '2th',
  'I TIMÓTEO': '1ti', '1 TIMÓTEO': '1ti', 'I TIMOTEO': '1ti', '1 TIMOTEO': '1ti',
  'II TIMÓTEO': '2ti', '2 TIMÓTEO': '2ti', 'II TIMOTEO': '2ti', '2 TIMOTEO': '2ti',
  'TITO': 'tit',
  'FILEMOM': 'phm',
  'HEBREUS': 'heb',
  'TIAGO': 'jas',
  'I PEDRO': '1pe', '1 PEDRO': '1pe',
  'II PEDRO': '2pe', '2 PEDRO': '2pe',
  'I JOÃO': '1jo', '1 JOÃO': '1jo', 'I JOAO': '1jo', '1 JOAO': '1jo',
  'II JOÃO': '2jo', '2 JOÃO': '2jo', 'II JOAO': '2jo', '2 JOAO': '2jo',
  'III JOÃO': '3jo', '3 JOÃO': '3jo', 'III JOAO': '3jo', '3 JOAO': '3jo',
  'JUDAS': 'jde',
  'APOCALIPSE': 'rev',
};

// Indexed studies by book_chapter_verse
type StudiesIndex = Map<string, string[]>;

let studiesCache: StudiesIndex | null = null;
let loadingStudies = false;

// Function to clean study text - remove Bible references and keep only commentary
function cleanStudyText(text: string): string {
  if (!text) return '';
  
  // Remove patterns like "Ex. 13:04; 23:15; 34:18" or "(cf. Gn 8:13;. Ex 12:2)"
  // Remove verse references with book abbreviations
  let cleaned = text
    // Remove parenthetical references like "(cf. Gn 8:13;. Ex 12:2, 18; 40:2)"
    .replace(/\(cf\.[^)]+\)/gi, '')
    // Remove patterns like "Ex. 13:04; 23:15" 
    .replace(/\b[1-3]?\s?[A-Z][a-záéíóúãõç]+\.?\s*\d+[:\.\d,;\s-]+/gi, '')
    // Remove standalone chapter:verse patterns like "23:15; 34:18"
    .replace(/\b\d+:\d+[,;\s\d:-]*/g, '')
    // Remove book abbreviations with dots like "Lv.", "Gn.", "Ex."
    .replace(/\b[A-Z][a-z]{1,3}\.\s*\d+/gi, '')
    // Remove parenthetical verse references
    .replace(/\([^)]*\d+:\d+[^)]*\)/g, '')
    // Clean up extra spaces and punctuation
    .replace(/\s+/g, ' ')
    .replace(/[;,]\s*[;,]/g, ';')
    .replace(/^\s*[;,:\s]+/, '')
    .replace(/[;,:\s]+$/, '')
    .trim();
  
  // If after cleaning we have very little content, return empty
  if (cleaned.length < 20) return '';
  
  return cleaned;
}

export function useBibleStudies() {
  const [studies, setStudies] = useState<StudiesIndex | null>(studiesCache);
  const [loading, setLoading] = useState(!studiesCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studiesCache) {
      setStudies(studiesCache);
      setLoading(false);
      return;
    }

    if (loadingStudies) return;
    loadingStudies = true;
    setLoading(true);

    fetch('/bible/estudos-esv.json')
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar estudos');
        return res.json();
      })
      .then((data: StudyEntry[]) => {
        const index: StudiesIndex = new Map();
        
        for (const entry of data) {
          const bookName = entry.b.toUpperCase().trim();
          const abbrev = BOOK_NAME_TO_ABBREV[bookName];
          
          if (!abbrev) {
            continue;
          }
          
          // Handle verse ranges like "14" or "14-16"
          const verseStr = String(entry.v);
          const verses = verseStr.includes('-') 
            ? verseStr.split('-').map(v => parseInt(v.trim()))
            : [parseInt(verseStr)];
          
          const firstVerse = verses[0];
          if (isNaN(firstVerse)) continue;
          
          // Clean the study text to remove Bible references
          const cleanedText = cleanStudyText(entry.t);
          if (!cleanedText) continue;
          
          // Create key: book_chapter_verse
          const key = `${abbrev}_${entry.c}_${firstVerse}`;
          
          if (!index.has(key)) {
            index.set(key, []);
          }
          index.get(key)!.push(cleanedText);
        }
        
        studiesCache = index;
        setStudies(index);
        setLoading(false);
        loadingStudies = false;
        console.log(`Loaded ${index.size} verse studies`);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        loadingStudies = false;
      });
  }, []);

  const getStudyForVerse = useCallback((bookAbbrev: string, chapter: number, verse: number): string[] => {
    if (!studies) return [];
    
    const key = `${bookAbbrev.toLowerCase()}_${chapter}_${verse}`;
    return studies.get(key) || [];
  }, [studies]);

  const hasStudyForVerse = useCallback((bookAbbrev: string, chapter: number, verse: number): boolean => {
    if (!studies) return false;
    
    const key = `${bookAbbrev.toLowerCase()}_${chapter}_${verse}`;
    return studies.has(key);
  }, [studies]);

  return {
    studies,
    loading,
    error,
    getStudyForVerse,
    hasStudyForVerse,
  };
}
