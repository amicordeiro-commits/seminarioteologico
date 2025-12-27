import { useState, useEffect, useCallback } from 'react';

interface StudyItem {
  versiculo: string;
  estudo: string;
}

interface ChapterData {
  capitulo: number;
  estudos: StudyItem[];
}

interface BookData {
  livro: string;
  capitulos: ChapterData[];
}

// Mapping from Portuguese book names to abbreviations
const BOOK_NAME_TO_ABBREV: Record<string, string> = {
  'Gênesis': 'gen', 'Genesis': 'gen',
  'Êxodo': 'exo', 'Exodo': 'exo',
  'Levítico': 'lev', 'Levitico': 'lev',
  'Números': 'num', 'Numeros': 'num',
  'Deuteronômio': 'deu', 'Deuteronomio': 'deu',
  'Josué': 'jos', 'Josue': 'jos',
  'Juízes': 'jdg', 'Juizes': 'jdg',
  'Rute': 'rth',
  '1 Samuel': '1sa', 'I Samuel': '1sa',
  '2 Samuel': '2sa', 'II Samuel': '2sa',
  '1 Reis': '1ki', 'I Reis': '1ki',
  '2 Reis': '2ki', 'II Reis': '2ki',
  '1 Crônicas': '1ch', '1 Cronicas': '1ch', 'I Crônicas': '1ch', 'I Cronicas': '1ch',
  '2 Crônicas': '2ch', '2 Cronicas': '2ch', 'II Crônicas': '2ch', 'II Cronicas': '2ch',
  'Esdras': 'ezr',
  'Neemias': 'neh',
  'Ester': 'est',
  'Jó': 'job', 'Jo': 'job',
  'Salmos': 'psa',
  'Provérbios': 'pro', 'Proverbios': 'pro',
  'Eclesiastes': 'ecc',
  'Cantares': 'sng', 'Cânticos': 'sng', 'Canticos': 'sng',
  'Isaías': 'isa', 'Isaias': 'isa',
  'Jeremias': 'jer',
  'Lamentações': 'lam', 'Lamentacoes': 'lam',
  'Ezequiel': 'eze',
  'Daniel': 'dan',
  'Oséias': 'hos', 'Oseias': 'hos',
  'Joel': 'joe',
  'Amós': 'amo', 'Amos': 'amo',
  'Obadias': 'oba',
  'Jonas': 'jon',
  'Miquéias': 'mic', 'Miqueias': 'mic',
  'Naum': 'nah',
  'Habacuque': 'hab',
  'Sofonias': 'zep',
  'Ageu': 'hag',
  'Zacarias': 'zec',
  'Malaquias': 'mal',
  'Mateus': 'mat',
  'Marcos': 'mar',
  'Lucas': 'luk',
  'João': 'jhn', 'Joao': 'jhn',
  'Atos': 'act',
  'Romanos': 'rom',
  '1 Coríntios': '1co', '1 Corintios': '1co', 'I Coríntios': '1co', 'I Corintios': '1co',
  '2 Coríntios': '2co', '2 Corintios': '2co', 'II Coríntios': '2co', 'II Corintios': '2co',
  'Gálatas': 'gal', 'Galatas': 'gal',
  'Efésios': 'eph', 'Efesios': 'eph',
  'Filipenses': 'phl',
  'Colossenses': 'col',
  '1 Tessalonicenses': '1th', 'I Tessalonicenses': '1th',
  '2 Tessalonicenses': '2th', 'II Tessalonicenses': '2th',
  '1 Timóteo': '1ti', '1 Timoteo': '1ti', 'I Timóteo': '1ti', 'I Timoteo': '1ti',
  '2 Timóteo': '2ti', '2 Timoteo': '2ti', 'II Timóteo': '2ti', 'II Timoteo': '2ti',
  'Tito': 'tit',
  'Filemom': 'phm',
  'Hebreus': 'heb',
  'Tiago': 'jas',
  '1 Pedro': '1pe', 'I Pedro': '1pe',
  '2 Pedro': '2pe', 'II Pedro': '2pe',
  '1 João': '1jo', '1 Joao': '1jo', 'I João': '1jo', 'I Joao': '1jo',
  '2 João': '2jo', '2 Joao': '2jo', 'II João': '2jo', 'II Joao': '2jo',
  '3 João': '3jo', '3 Joao': '3jo', 'III João': '3jo', 'III Joao': '3jo',
  'Judas': 'jde',
  'Apocalipse': 'rev',
};

// Indexed studies by book_chapter_verse
type StudiesIndex = Map<string, string[]>;

let studiesCache: StudiesIndex | null = null;
let loadingStudies = false;

// Parse verse string to get all verses it applies to
function parseVerseRange(verseStr: string): number[] {
  const verses: number[] = [];
  
  // Handle ranges like "1-9" or "14-16"
  if (verseStr.includes('-')) {
    const parts = verseStr.split('-');
    const start = parseInt(parts[0].replace(/^0+/, ''));
    const end = parseInt(parts[1].replace(/^0+/, ''));
    if (!isNaN(start) && !isNaN(end)) {
      for (let i = start; i <= end; i++) {
        verses.push(i);
      }
    }
  } else {
    // Single verse like "01" or "1"
    const num = parseInt(verseStr.replace(/^0+/, ''));
    if (!isNaN(num)) {
      verses.push(num);
    }
  }
  
  return verses;
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

    fetch('/bible/esv-study.json')
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar estudos');
        return res.json();
      })
      .then((data: BookData[]) => {
        const index: StudiesIndex = new Map();
        
        for (const book of data) {
          const abbrev = BOOK_NAME_TO_ABBREV[book.livro];
          
          if (!abbrev) {
            continue;
          }
          
          for (const chapter of book.capitulos) {
            for (const study of chapter.estudos) {
              const verses = parseVerseRange(study.versiculo);
              
              // Add study to each verse in the range
              for (const verse of verses) {
                const key = `${abbrev}_${chapter.capitulo}_${verse}`;
                
                if (!index.has(key)) {
                  index.set(key, []);
                }
                index.get(key)!.push(study.estudo);
              }
            }
          }
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
