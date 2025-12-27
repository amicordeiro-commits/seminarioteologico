import { useState, useEffect, useCallback } from 'react';

interface StudyComments {
  metadata: {
    title: string;
    description: string;
    language: string;
    total_books: number;
    total_verses_with_notes: number;
    format_version: string;
  };
  books: Record<string, Record<string, Record<string, string>>>;
}

// Book name mapping from abbrev to full Portuguese name
const BOOK_NAME_MAP: Record<string, string> = {
  'gn': 'Gênesis', 'ex': 'Êxodo', 'lv': 'Levítico', 'nm': 'Números', 'dt': 'Deuteronômio',
  'js': 'Josué', 'jz': 'Juízes', 'rt': 'Rute', '1sm': '1 Samuel', '2sm': '2 Samuel',
  '1rs': '1 Reis', '2rs': '2 Reis', '1cr': '1 Crônicas', '2cr': '2 Crônicas', 'ed': 'Esdras',
  'ne': 'Neemias', 'et': 'Ester', 'jó': 'Jó', 'sl': 'Salmos', 'pv': 'Provérbios',
  'ec': 'Eclesiastes', 'ct': 'Cânticos', 'is': 'Isaías', 'jr': 'Jeremias', 'lm': 'Lamentações',
  'ez': 'Ezequiel', 'dn': 'Daniel', 'os': 'Oséias', 'jl': 'Joel', 'am': 'Amós',
  'ob': 'Obadias', 'jn': 'Jonas', 'mq': 'Miquéias', 'na': 'Naum', 'hc': 'Habacuque',
  'sf': 'Sofonias', 'ag': 'Ageu', 'zc': 'Zacarias', 'ml': 'Malaquias',
  'mt': 'Mateus', 'mc': 'Marcos', 'lc': 'Lucas', 'jo': 'João', 'at': 'Atos',
  'rm': 'Romanos', '1co': '1 Coríntios', '2co': '2 Coríntios', 'gl': 'Gálatas', 'ef': 'Efésios',
  'fp': 'Filipenses', 'cl': 'Colossenses', '1ts': '1 Tessalonicenses', '2ts': '2 Tessalonicenses',
  '1tm': '1 Timóteo', '2tm': '2 Timóteo', 'tt': 'Tito', 'fm': 'Filemom', 'hb': 'Hebreus',
  'tg': 'Tiago', '1pe': '1 Pedro', '2pe': '2 Pedro', '1jo': '1 João', '2jo': '2 João',
  '3jo': '3 João', 'jd': 'Judas', 'ap': 'Apocalipse'
};

let commentsData: StudyComments | null = null;

export function useBibleComments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (commentsData) {
      setLoaded(true);
      setLoading(false);
      return;
    }

    fetch('/bible/study-comments.json')
      .then(res => res.json())
      .then((data: StudyComments) => {
        commentsData = data;
        setLoaded(true);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load study comments:', err);
        setError('Falha ao carregar comentários');
        setLoading(false);
      });
  }, []);

  const getComment = useCallback((bookAbbrev: string, chapter: number, verse: number): string | null => {
    if (!commentsData) return null;

    const bookName = BOOK_NAME_MAP[bookAbbrev.toLowerCase()];
    if (!bookName) return null;

    const bookData = commentsData.books[bookName];
    if (!bookData) return null;

    const chapterData = bookData[String(chapter)];
    if (!chapterData) return null;

    return chapterData[String(verse)] || null;
  }, []);

  const getChapterComments = useCallback((bookAbbrev: string, chapter: number): Record<number, string> => {
    if (!commentsData) return {};

    const bookName = BOOK_NAME_MAP[bookAbbrev.toLowerCase()];
    if (!bookName) return {};

    const bookData = commentsData.books[bookName];
    if (!bookData) return {};

    const chapterData = bookData[String(chapter)];
    if (!chapterData) return {};

    const result: Record<number, string> = {};
    for (const [verseNum, comment] of Object.entries(chapterData)) {
      result[parseInt(verseNum)] = comment;
    }
    return result;
  }, []);

  return {
    loading,
    error,
    loaded,
    getComment,
    getChapterComments,
  };
}