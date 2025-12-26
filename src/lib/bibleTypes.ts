// Tipos para a Bíblia de Estudo ESV

export interface BibleInfo {
  title: string;
  filename: string;
  file_size_kb: number;
  num_pages: number;
  conversion_date: string;
  metadata: {
    author: string;
    creator: string;
    producer: string;
    creation_date: string;
    modification_date: string;
  };
}

export interface TableOfContentsItem {
  item: string;
  page: number;
}

export interface BibleVerse {
  verse_number: number;
  text: string;
  studies: string[];
  id: string;
  tags?: string[];
}

export interface BibleChapter {
  chapter_number: number;
  verses: BibleVerse[];
}

export interface BibleBook {
  title: string;
  abbrev: string;
  chapters: BibleChapter[];
}

export interface BibleData {
  info: BibleInfo;
  table_of_contents: TableOfContentsItem[];
  bible_content: BibleBook[];
}

// Mapeamento de abreviações para nomes em português
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

// Livros do Antigo Testamento
export const OLD_TESTAMENT_BOOKS = [
  'gn', 'ex', 'lv', 'nm', 'dt', 'js', 'jz', 'rt', '1sm', '2sm',
  '1rs', '2rs', '1cr', '2cr', 'ed', 'ne', 'et', 'jó', 'sl', 'pv',
  'ec', 'ct', 'is', 'jr', 'lm', 'ez', 'dn', 'os', 'jl', 'am',
  'ob', 'jn', 'mq', 'na', 'hc', 'sf', 'ag', 'zc', 'ml'
];

// Livros do Novo Testamento
export const NEW_TESTAMENT_BOOKS = [
  'mt', 'mc', 'lc', 'jo', 'at', 'rm', '1co', '2co', 'gl', 'ef',
  'fp', 'cl', '1ts', '2ts', '1tm', '2tm', 'tt', 'fm', 'hb', 'tg',
  '1pe', '2pe', '1jo', '2jo', '3jo', 'jd', 'ap'
];

export function getBookName(abbrev: string): string {
  return BOOK_NAMES[abbrev.toLowerCase()] || abbrev;
}

export function getTestament(abbrev: string): 'old' | 'new' {
  return OLD_TESTAMENT_BOOKS.includes(abbrev.toLowerCase()) ? 'old' : 'new';
}
