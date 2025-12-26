// Types for Strong's Concordance data

export interface StrongsEntry {
  Gk_word?: string;
  Hb_word?: string;
  transliteration: string;
  strongs_def: string;
  part_of_speech: string;
  root_word: string;
  occurrences: string;
  outline_usage: string;
}

export interface StrongsLexicon {
  [key: string]: StrongsEntry;
}

export interface KJVBook {
  [bookAbbrev: string]: {
    [chapterKey: string]: {
      [verseKey: string]: {
        en: string;
        bg?: string;
        ch?: string;
        sp?: string;
      };
    };
  };
}

export interface ParsedWord {
  text: string;
  strongsNumbers: string[];
  isItalic: boolean;
}

// Map ESV abbreviations to KJV file names
export const ESV_TO_KJV_ABBREV: Record<string, string> = {
  'gn': 'Gen', 'ex': 'Exo', 'lv': 'Lev', 'nm': 'Num', 'dt': 'Deu',
  'js': 'Jos', 'jz': 'Jdg', 'rt': 'Rth', '1sm': '1Sa', '2sm': '2Sa',
  '1rs': '1Ki', '2rs': '2Ki', '1cr': '1Ch', '2cr': '2Ch', 'ed': 'Ezr',
  'ne': 'Neh', 'et': 'Est', 'jó': 'Job', 'sl': 'Psa', 'pv': 'Pro',
  'ec': 'Ecc', 'ct': 'Sng', 'is': 'Isa', 'jr': 'Jer', 'lm': 'Lam',
  'ez': 'Eze', 'dn': 'Dan', 'os': 'Hos', 'jl': 'Joe', 'am': 'Amo',
  'ob': 'Oba', 'jn': 'Jon', 'mq': 'Mic', 'na': 'Nah', 'hc': 'Hab',
  'sf': 'Zep', 'ag': 'Hag', 'zc': 'Zec', 'ml': 'Mal',
  'mt': 'Mat', 'mc': 'Mar', 'lc': 'Luk', 'jo': 'Jhn', 'at': 'Act',
  'rm': 'Rom', '1co': '1Co', '2co': '2Co', 'gl': 'Gal', 'ef': 'Eph',
  'fp': 'Phl', 'cl': 'Col', '1ts': '1Th', '2ts': '2Th', '1tm': '1Ti',
  '2tm': '2Ti', 'tt': 'Tit', 'fm': 'Phm', 'hb': 'Heb', 'tg': 'Jas',
  '1pe': '1Pe', '2pe': '2Pe', '1jo': '1Jo', '2jo': '2Jo', '3jo': '3Jo',
  'jd': 'Jde', 'ap': 'Rev'
};

// Parse verse text with Strong's numbers into structured data
export function parseStrongsText(text: string): ParsedWord[] {
  const words: ParsedWord[] = [];
  
  // Replace HTML entities and clean up
  let cleanText = text
    .replace(/&#8212-/g, '—')
    .replace(/&quot-/g, '"')
    .replace(/&#39;/g, "'");
  
  // Split into segments handling italics and Strong's tags
  const regex = /(<em>.*?<\/em>|[^\s\[<]+|\[[HG]\d+\])/g;
  let match;
  let currentWord: ParsedWord | null = null;
  
  while ((match = regex.exec(cleanText)) !== null) {
    const segment = match[0];
    
    // Check if it's a Strong's number
    const strongsMatch = segment.match(/\[([HG]\d+)\]/);
    if (strongsMatch) {
      if (currentWord) {
        currentWord.strongsNumbers.push(strongsMatch[1]);
      }
      continue;
    }
    
    // Check if it's italic text
    const italicMatch = segment.match(/<em>(.*?)<\/em>/);
    if (italicMatch) {
      // Push previous word
      if (currentWord) {
        words.push(currentWord);
      }
      currentWord = {
        text: italicMatch[1],
        strongsNumbers: [],
        isItalic: true
      };
      continue;
    }
    
    // Regular word
    if (segment.trim()) {
      if (currentWord) {
        words.push(currentWord);
      }
      currentWord = {
        text: segment,
        strongsNumbers: [],
        isItalic: false
      };
    }
  }
  
  // Push the last word
  if (currentWord) {
    words.push(currentWord);
  }
  
  return words;
}

// Clean HTML entities from definitions
export function cleanDefinition(text: string): string {
  return text
    .replace(/&#8212-/g, '—')
    .replace(/&#8212/g, '—')
    .replace(/&quot-/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/null/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
