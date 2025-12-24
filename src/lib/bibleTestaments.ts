// Divisão dos livros por Testamento
export const OLD_TESTAMENT_BOOKS = [
  'gn', 'ex', 'lv', 'nm', 'dt', 'js', 'jz', 'rt', 
  '1sm', '2sm', '1rs', '2rs', '1cr', '2cr', 
  'ed', 'ne', 'et', 'jó', 'sl', 'pv', 'ec', 'ct',
  'is', 'jr', 'lm', 'ez', 'dn', 'os', 'jl', 'am', 
  'ob', 'jn', 'mq', 'na', 'hc', 'sf', 'ag', 'zc', 'ml'
];

export const NEW_TESTAMENT_BOOKS = [
  'mt', 'mc', 'lc', 'jo', 'at', 'rm', 
  '1co', '2co', 'gl', 'ef', 'fp', 'cl', 
  '1ts', '2ts', '1tm', '2tm', 'tt', 'fm', 
  'hb', 'tg', '1pe', '2pe', '1jo', '2jo', '3jo', 'jd', 'ap'
];

export type Testament = 'old' | 'new';

export function getTestament(bookAbbrev: string): Testament {
  const abbrev = bookAbbrev.toLowerCase();
  if (OLD_TESTAMENT_BOOKS.includes(abbrev)) return 'old';
  return 'new';
}

export function getTestamentName(testament: Testament): string {
  return testament === 'old' ? 'Antigo Testamento' : 'Novo Testamento';
}
