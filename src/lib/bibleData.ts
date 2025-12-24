export const BOOK_NAMES: Record<string, string> = {
  gn: 'Gênesis',
  ex: 'Êxodo',
  lv: 'Levítico',
  nm: 'Números',
  dt: 'Deuteronômio',
  js: 'Josué',
  jz: 'Juízes',
  rt: 'Rute',
  '1sm': '1 Samuel',
  '2sm': '2 Samuel',
  '1rs': '1 Reis',
  '2rs': '2 Reis',
  '1cr': '1 Crônicas',
  '2cr': '2 Crônicas',
  ed: 'Esdras',
  ne: 'Neemias',
  et: 'Ester',
  jó: 'Jó',
  sl: 'Salmos',
  pv: 'Provérbios',
  ec: 'Eclesiastes',
  ct: 'Cânticos',
  is: 'Isaías',
  jr: 'Jeremias',
  lm: 'Lamentações',
  ez: 'Ezequiel',
  dn: 'Daniel',
  os: 'Oséias',
  jl: 'Joel',
  am: 'Amós',
  ob: 'Obadias',
  jn: 'Jonas',
  mq: 'Miquéias',
  na: 'Naum',
  hc: 'Habacuque',
  sf: 'Sofonias',
  ag: 'Ageu',
  zc: 'Zacarias',
  ml: 'Malaquias',
  mt: 'Mateus',
  mc: 'Marcos',
  lc: 'Lucas',
  jo: 'João',
  at: 'Atos',
  rm: 'Romanos',
  '1co': '1 Coríntios',
  '2co': '2 Coríntios',
  gl: 'Gálatas',
  ef: 'Efésios',
  fp: 'Filipenses',
  cl: 'Colossenses',
  '1ts': '1 Tessalonicenses',
  '2ts': '2 Tessalonicenses',
  '1tm': '1 Timóteo',
  '2tm': '2 Timóteo',
  tt: 'Tito',
  fm: 'Filemom',
  hb: 'Hebreus',
  tg: 'Tiago',
  '1pe': '1 Pedro',
  '2pe': '2 Pedro',
  '1jo': '1 João',
  '2jo': '2 João',
  '3jo': '3 João',
  jd: 'Judas',
  ap: 'Apocalipse',
};

export const TRANSLATION_NAMES: Record<string, string> = {
  aa: 'Almeida Atualizada',
  acf: 'Almeida Corrigida Fiel',
  nvi: 'Nova Versão Internacional',
};

export interface BibleBook {
  abbrev: string;
  chapters: string[][];
}

export interface BibleVerse {
  book: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

let cachedBibles: Record<string, BibleBook[]> = {};

export async function loadBible(translation: string): Promise<BibleBook[]> {
  if (cachedBibles[translation]) {
    return cachedBibles[translation];
  }
  
  const response = await fetch(`/bibles/${translation}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load ${translation} Bible`);
  }
  
  const data = await response.json();
  cachedBibles[translation] = data;
  return data;
}

export function getBookName(abbrev: string): string {
  return BOOK_NAMES[abbrev.toLowerCase()] || abbrev;
}

export function getVerse(
  bible: BibleBook[],
  bookAbbrev: string,
  chapter: number,
  verse: number
): string | null {
  const book = bible.find(b => b.abbrev.toLowerCase() === bookAbbrev.toLowerCase());
  if (!book) return null;
  
  const chapterData = book.chapters[chapter - 1];
  if (!chapterData) return null;
  
  return chapterData[verse - 1] || null;
}

export function getChapter(
  bible: BibleBook[],
  bookAbbrev: string,
  chapter: number
): BibleVerse[] {
  const book = bible.find(b => b.abbrev.toLowerCase() === bookAbbrev.toLowerCase());
  if (!book) return [];
  
  const chapterData = book.chapters[chapter - 1];
  if (!chapterData) return [];
  
  return chapterData.map((text, index) => ({
    book: bookAbbrev,
    bookName: getBookName(bookAbbrev),
    chapter,
    verse: index + 1,
    text,
  }));
}

export function searchBible(
  bible: BibleBook[],
  query: string,
  limit = 50
): BibleVerse[] {
  const results: BibleVerse[] = [];
  const lowerQuery = query.toLowerCase();
  
  for (const book of bible) {
    for (let chapterIdx = 0; chapterIdx < book.chapters.length; chapterIdx++) {
      const chapter = book.chapters[chapterIdx];
      for (let verseIdx = 0; verseIdx < chapter.length; verseIdx++) {
        if (chapter[verseIdx].toLowerCase().includes(lowerQuery)) {
          results.push({
            book: book.abbrev,
            bookName: getBookName(book.abbrev),
            chapter: chapterIdx + 1,
            verse: verseIdx + 1,
            text: chapter[verseIdx],
          });
          if (results.length >= limit) return results;
        }
      }
    }
  }
  
  return results;
}
