import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Loader2, X, BookOpen, ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, Moon, Sun, Bookmark, BookmarkCheck 
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";

interface LessonViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string | null;
  loading?: boolean;
  category?: string;
}

// Normaliza quebras de linha e reconstrói parágrafos
function normalizeText(text: string): string {
  if (!text) return "";
  let t = text.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, "");
  t = t.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  t = t.replace(/[ \t]+$/gm, "");
  return t.trim();
}

function isHeadingLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,.()]+$/.test(t) && t.length < 80) return true;
  if (/^[IVX]+[\.\)]\s/.test(t) || /^\d+[\.\)]\s/.test(t)) return true;
  if (/^[a-zA-Z][\.\)]\s/.test(t) && t.length < 100) return true;
  if (/^[-•]\s/.test(t)) return true;
  return false;
}

function isIncompleteLine(line: string): boolean {
  const t = line.trim();
  if (!t || t.length < 20) return false;
  if (/[.!?:;]$/.test(t)) return false;
  if (/\)$/.test(t) && /\([A-Z][a-z]+ \d/.test(t)) return false;
  return true;
}

function splitIntoBlocks(text: string): string[] {
  const normalized = normalizeText(text);
  const lines = normalized.split("\n");
  const rawBlocks: string[] = [];
  let currentBlock = "";

  const pushCurrent = () => {
    if (currentBlock.trim()) rawBlocks.push(currentBlock.trim());
    currentBlock = "";
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const nextLine = lines[i + 1]?.trim() || "";

    if (!trimmed) {
      pushCurrent();
      continue;
    }

    if (isHeadingLine(trimmed) && (!currentBlock || !isIncompleteLine(currentBlock))) {
      pushCurrent();
      currentBlock = trimmed;
      if (!nextLine || isHeadingLine(nextLine)) pushCurrent();
      continue;
    }

    if (currentBlock) {
      if (/-$/.test(currentBlock.trim())) {
        currentBlock = currentBlock.replace(/-\s*$/, "");
        currentBlock += trimmed;
      } else {
        currentBlock += " " + trimmed;
      }
    } else {
      currentBlock = trimmed;
    }
  }

  pushCurrent();

  const merged: string[] = [];
  for (const b of rawBlocks) {
    const prev = merged[merged.length - 1];
    if (!prev) {
      merged.push(b);
      continue;
    }

    const bTrim = b.trim();
    const startsLikeContinuation = /^[a-záàâãçéêíóôõúü(""']/.test(bTrim);
    const prevEndsIncomplete = isIncompleteLine(prev) || /[,–—:-]$/.test(prev.trim());
    const shouldMerge = prevEndsIncomplete && startsLikeContinuation && !isHeadingLine(bTrim);

    if (shouldMerge) {
      merged[merged.length - 1] = prev.replace(/\s+$/, "") + " " + bTrim;
    } else {
      merged.push(bTrim);
    }
  }

  return merged.filter((b) => b.trim());
}

function splitIntoPages(text: string, charsPerPage = 5000): string[] {
  if (!text) return [];

  const blocks = splitIntoBlocks(text);
  const pages: string[] = [];
  let currentPage = "";

  for (const b of blocks) {
    if (currentPage.length + b.length > charsPerPage && currentPage) {
      pages.push(currentPage.trim());
      currentPage = b;
    } else {
      currentPage += (currentPage ? "\n\n" : "") + b;
    }
  }

  if (currentPage.trim()) pages.push(currentPage.trim());
  return pages.length > 0 ? pages : [text];
}

function parseSpanStyle(style: string): CSSProperties | undefined {
  const out: CSSProperties = {};

  const colorMatch = style.match(/color:\s*([^;]+)\s*;?/i);
  if (colorMatch) {
    const c = colorMatch[1].trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)) out.color = c;
  }

  const sizeMatch = style.match(/font-size:\s*(\d+(?:\.\d+)?px)\s*;?/i);
  if (sizeMatch) {
    out.fontSize = sizeMatch[1];
  }

  return Object.keys(out).length ? out : undefined;
}

function unwrapTextAlignBlock(text: string): { align: CSSProperties["textAlign"]; inner: string } | null {
  const m = text.match(/^<div style="text-align:\s*(left|center|right|justify)\s*">([\s\S]*)<\/div>$/i);
  if (!m) return null;
  return { align: m[1] as CSSProperties["textAlign"], inner: m[2] };
}

function stripInlineMarkup(text: string): string {
  return (text || "")
    .replace(/<span style="[^"]+">/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/<u>/gi, "")
    .replace(/<\/u>/gi, "")
    .replace(/\*\*/g, "")
    .replace(/\*(?!\*)/g, "");
}

// Remove todas as tags HTML e retorna apenas o texto limpo
function stripAllHtmlTags(html: string): string {
  if (!html) return "";
  // Remove todas as tags HTML
  let text = html.replace(/<[^>]*>/g, " ");
  // Decodifica entidades HTML comuns
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/&apos;/gi, "'");
  // Normaliza espaços múltiplos
  text = text.replace(/\s+/g, " ");
  return text.trim();
}

// Verifica se o texto contém tags HTML
function containsHtmlTags(text: string): boolean {
  return /<[a-zA-Z][^>]*>/.test(text);
}

function renderInline(text: string): ReactNode {
  if (!text) return null;

  // Se o conteúdo tem muitas tags HTML complexas, limpa tudo e retorna texto puro
  const htmlTagCount = (text.match(/<[^>]+>/g) || []).length;
  if (htmlTagCount > 10) {
    return stripAllHtmlTags(text);
  }

  const nodes: ReactNode[] = [];
  let remaining = text;

  const patterns = [
    { type: "div" as const, re: /<div[^>]*>([\s\S]*?)<\/div>/ },
    { type: "font" as const, re: /<font[^>]*>([\s\S]*?)<\/font>/ },
    { type: "p" as const, re: /<p[^>]*>([\s\S]*?)<\/p>/ },
    { type: "br" as const, re: /<br\s*\/?>/ },
    { type: "span" as const, re: /<span[^>]*>([\s\S]*?)<\/span>/ },
    { type: "u" as const, re: /<u>([\s\S]*?)<\/u>/ },
    { type: "b" as const, re: /<b>([\s\S]*?)<\/b>/ },
    { type: "strong" as const, re: /<strong>([\s\S]*?)<\/strong>/ },
    { type: "i" as const, re: /<i>([\s\S]*?)<\/i>/ },
    { type: "em" as const, re: /<em>([\s\S]*?)<\/em>/ },
    { type: "bold" as const, re: /\*\*([\s\S]+?)\*\*/ },
    { type: "italic" as const, re: /\*(?!\*)([\s\S]+?)\*(?!\*)/ },
  ];

  let iterations = 0;
  const maxIterations = 500;

  while (remaining.length && iterations < maxIterations) {
    iterations++;
    let best:
      | { type: (typeof patterns)[number]["type"]; index: number; match: RegExpMatchArray; re: RegExp }
      | null = null;

    for (const p of patterns) {
      const m = remaining.match(p.re);
      if (!m || m.index == null) continue;
      if (!best || m.index < best.index) best = { type: p.type, index: m.index, match: m, re: p.re };
    }

    if (!best) {
      // Remove qualquer tag HTML restante
      nodes.push(stripAllHtmlTags(remaining));
      break;
    }

    if (best.index > 0) {
      const before = remaining.slice(0, best.index);
      nodes.push(stripAllHtmlTags(before));
    }

    const full = best.match[0];
    const inner = best.match[1] ?? "";

    switch (best.type) {
      case "div":
      case "p":
        // Renderiza o conteúdo interno, adiciona espaço
        const divContent = renderInline(inner);
        if (divContent) {
          nodes.push(<span key={nodes.length}>{divContent} </span>);
        }
        break;
      case "font":
        nodes.push(<span key={nodes.length}>{renderInline(inner)}</span>);
        break;
      case "br":
        nodes.push(" ");
        break;
      case "span":
        nodes.push(<span key={nodes.length}>{renderInline(inner)}</span>);
        break;
      case "u":
        nodes.push(
          <u key={nodes.length} className="decoration-primary/50 underline-offset-4">
            {renderInline(inner)}
          </u>
        );
        break;
      case "b":
      case "strong":
      case "bold":
        nodes.push(
          <strong key={nodes.length} className="font-bold">
            {renderInline(inner)}
          </strong>
        );
        break;
      case "i":
      case "em":
      case "italic":
        nodes.push(
          <em key={nodes.length} className="italic">
            {renderInline(inner)}
          </em>
        );
        break;
    }

    remaining = remaining.slice(best.index + full.length);
  }

  // Fallback se atingiu limite de iterações
  if (iterations >= maxIterations && remaining.length) {
    nodes.push(stripAllHtmlTags(remaining));
  }

  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

function detectBibleReference(text: string): boolean {
  return /\([A-Za-záéíóúâêôãõç]+\s*\d+[:.]\d+(?:-\d+)?\)/.test(text) ||
         /[A-Za-záéíóúâêôãõç]+\s+\d+[:.]\d+(?:-\d+)?/.test(text);
}

// Configurações do leitor salvas em localStorage
const STORAGE_KEY = "lesson-viewer-settings";

interface ViewerSettings {
  fontSize: number;
  nightMode: boolean;
  bookmarks: Record<string, number>; // title -> page
}

function loadSettings(): ViewerSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { fontSize: 100, nightMode: false, bookmarks: {} };
}

function saveSettings(settings: ViewerSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function LessonViewer({
  open,
  onOpenChange,
  title,
  content,
  loading = false,
  category,
}: LessonViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [settings, setSettings] = useState<ViewerSettings>(() => loadSettings());
  const [showControls, setShowControls] = useState(false);

  const { fontSize, nightMode, bookmarks } = settings;
  const isBookmarked = bookmarks[title] === currentPage;

  // Salva configurações quando mudam
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Restaura bookmark ao abrir
  useEffect(() => {
    if (open && title && bookmarks[title]) {
      setCurrentPage(bookmarks[title]);
    } else {
      setCurrentPage(1);
    }
  }, [open, title]);

  // Reset página quando conteúdo muda
  useEffect(() => {
    if (!bookmarks[title]) {
      setCurrentPage(1);
    }
  }, [content]);

  const pages = useMemo(() => splitIntoPages(content || ""), [content]);
  const totalPages = Math.max(1, pages.length);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const updateFontSize = useCallback((delta: number) => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.min(150, Math.max(70, prev.fontSize + delta))
    }));
  }, []);

  const toggleNightMode = useCallback(() => {
    setSettings(prev => ({ ...prev, nightMode: !prev.nightMode }));
  }, []);

  const toggleBookmark = useCallback(() => {
    setSettings(prev => {
      const newBookmarks = { ...prev.bookmarks };
      if (newBookmarks[title] === currentPage) {
        delete newBookmarks[title];
      } else {
        newBookmarks[title] = currentPage;
      }
      return { ...prev, bookmarks: newBookmarks };
    });
  }, [title, currentPage]);

  // Cores baseadas no modo - MELHORADAS
  const colors = nightMode
    ? {
        bg: "#0f0d0a",
        headerBg: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)",
        text: "#f5f5f4",
        textMuted: "#d6d3d1",
        accent: "#a78bfa",
        accentSecondary: "#818cf8",
        cardBg: "#1c1917",
        border: "rgba(167, 139, 250, 0.2)",
        highlight: "#fbbf24",
        quote: "#22d3ee",
      }
    : {
        bg: "#fffbf5",
        headerBg: "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)",
        text: "#1c1917",
        textMuted: "#44403c",
        accent: "#7c3aed",
        accentSecondary: "#6366f1",
        cardBg: "#fef3c7",
        border: "rgba(124, 58, 237, 0.15)",
        highlight: "#f59e0b",
        quote: "#0891b2",
      };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!fixed !inset-0 !max-w-none !w-screen !h-screen !translate-x-0 !translate-y-0 !left-0 !top-0 flex flex-col p-0 gap-0 overflow-hidden !rounded-none border-none transition-colors duration-300"
        style={{ backgroundColor: colors.bg }}
      >
        {/* Header */}
        <header 
          className="flex items-center justify-between px-4 sm:px-8 py-3 text-white shrink-0 shadow-lg"
          style={{ background: colors.headerBg }}
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-sm sm:text-lg truncate tracking-wide">{title}</h2>
              {category && <p className="text-[10px] sm:text-xs opacity-75 font-medium uppercase tracking-wider">{category}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Controles de leitura */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowControls(!showControls)}
              className="text-white hover:bg-white/20 h-9 w-9"
              title="Controles de leitura"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNightMode}
              className="text-white hover:bg-white/20 h-9 w-9"
              title={nightMode ? "Modo claro" : "Modo noturno"}
            >
              {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleBookmark}
              className="text-white hover:bg-white/20 h-9 w-9"
              title={isBookmarked ? "Remover marcador" : "Marcar página"}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-white" /> : <Bookmark className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20 h-9 w-9"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Barra de controles expansível */}
        {showControls && (
          <div 
            className="px-4 sm:px-8 py-3 flex items-center justify-center gap-4 sm:gap-8 border-b"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
          >
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateFontSize(-10)}
                disabled={fontSize <= 70}
                className="h-8 w-8"
                style={{ borderColor: colors.border, color: colors.text }}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[3rem] text-center" style={{ color: colors.text }}>
                {fontSize}%
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateFontSize(10)}
                disabled={fontSize >= 150}
                className="h-8 w-8"
                style={{ borderColor: colors.border, color: colors.text }}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs" style={{ color: colors.textMuted }}>Tamanho da fonte</span>
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setSettings(prev => ({ ...prev, fontSize: v }))}
                min={70}
                max={150}
                step={5}
                className="w-32"
              />
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-hidden flex">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ backgroundColor: colors.bg }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.accent}20` }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.accent }} />
              </div>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>Carregando conteúdo...</p>
            </div>
          ) : content ? (
            <div className="flex-1 flex flex-col">
              <ScrollArea className="flex-1" style={{ backgroundColor: colors.bg }}>
                <article 
                  className="w-full max-w-3xl mx-auto px-5 sm:px-10 lg:px-14 py-10 sm:py-14"
                  style={{ fontSize: `${fontSize}%` }}
                >
                  {/* Cabeçalho na primeira página - MELHORADO */}
                  {currentPage === 1 && (
                    <div className="mb-12 sm:mb-16 pb-8 sm:pb-10 border-b-2 relative overflow-hidden" style={{ borderColor: `${colors.accent}30` }}>
                      {/* Decoração de fundo */}
                      <div 
                        className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 50% 0%, ${colors.accent} 0%, transparent 70%)`
                        }}
                      />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-6">
                          <div className="h-0.5 w-16 rounded-full" style={{ background: `linear-gradient(to right, transparent, ${colors.accent})` }} />
                          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: colors.accent, boxShadow: `0 0 20px ${colors.accent}` }} />
                          <div className="h-0.5 w-16 rounded-full" style={{ background: `linear-gradient(to left, transparent, ${colors.accent})` }} />
                        </div>
                        
                        <p 
                          className="text-[10px] sm:text-xs uppercase tracking-[0.35em] mb-5 font-bold text-center px-4 py-2 rounded-full w-fit mx-auto"
                          style={{ 
                            color: colors.accent, 
                            backgroundColor: `${colors.accent}15`,
                            border: `1px solid ${colors.accent}30`
                          }}
                        >
                          {category || "Disciplina"}
                        </p>
                        
                        <h1 
                          className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight text-center mb-6"
                          style={{ 
                            color: colors.text,
                            textShadow: nightMode ? `0 2px 20px ${colors.accent}30` : 'none'
                          }}
                        >
                          {title}
                        </h1>
                        
                        <div 
                          className="flex items-center justify-center gap-3 text-sm font-medium px-5 py-2.5 rounded-full w-fit mx-auto"
                          style={{ 
                            background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accentSecondary}20)`,
                            color: colors.accent 
                          }}
                        >
                          <span>📖</span>
                          <span>P.O.D Seminário Teológico</span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-3 mt-8">
                          <div className="h-px w-24" style={{ background: `linear-gradient(to right, transparent, ${colors.accent}40)` }} />
                          <div className="text-2xl" style={{ color: colors.highlight }}>✦</div>
                          <div className="h-px w-24" style={{ background: `linear-gradient(to left, transparent, ${colors.accent}40)` }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Texto com formatação */}
                  <div className="space-y-5 sm:space-y-6">
                    {splitIntoBlocks(pages[currentPage - 1] || "").map((block, i) => {
                      const raw = block.trim();
                      if (!raw) return null;

                      const unwrapped = unwrapTextAlignBlock(raw);
                      const align = unwrapped?.align;
                      const display = (unwrapped?.inner ?? raw).trim();
                      const detect = stripInlineMarkup(display).trim();

                      const isMainHeading =
                        /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,.()]+$/.test(detect) &&
                        detect.length < 80 &&
                        !detect.includes(".");
                      const isNumberedTopic = /^[IVX]+[\.\)]\s/.test(detect) || /^\d+[\.\)]\s/.test(detect);
                      const isLetterTopic = /^[a-zA-Z][\.\)]\s/.test(detect) && detect.length < 200;
                      const isBulletPoint = /^[-•]\s/.test(detect);
                      const hasBibleRef = detectBibleReference(detect);

                      // Título principal - MELHORADO
                      if (isMainHeading) {
                        return (
                          <section key={i} className="mt-12 sm:mt-14 first:mt-0">
                            <div className="relative py-5 sm:py-6">
                              <div 
                                className="absolute left-0 top-0 bottom-0 w-1.5 rounded-full" 
                                style={{ 
                                  background: `linear-gradient(to bottom, ${colors.accent}, ${colors.accentSecondary}, ${colors.highlight})`,
                                  boxShadow: `0 0 15px ${colors.accent}40`
                                }} 
                              />
                              <h2 
                                className="pl-6 sm:pl-7 text-xl sm:text-2xl lg:text-3xl font-serif font-bold leading-snug tracking-wide" 
                                style={{ 
                                  color: colors.text,
                                  textShadow: nightMode ? `0 1px 10px ${colors.accent}20` : 'none'
                                }}
                              >
                                {renderInline(display)}
                              </h2>
                            </div>
                          </section>
                        );
                      }

                      // Subtópico numerado - MELHORADO
                      if (isNumberedTopic) {
                        const num = detect.match(/^([IVX\d]+)/)?.[1];
                        const body = display.replace(/^[IVX\d]+[\.\)]\s*/, "");
                        return (
                          <div key={i} className="mt-8 sm:mt-10 mb-4 sm:mb-5">
                            <div 
                              className="flex items-start gap-4 sm:gap-5 rounded-xl p-5 sm:p-6 border-2 shadow-lg transition-all hover:scale-[1.01]"
                              style={{ 
                                backgroundColor: colors.cardBg, 
                                borderColor: colors.accent,
                                boxShadow: `0 4px 20px ${colors.accent}15`
                              }}
                            >
                              <div 
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-white flex items-center justify-center shrink-0 font-bold text-sm sm:text-base font-serif"
                                style={{ 
                                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentSecondary})`,
                                  boxShadow: `0 4px 15px ${colors.accent}50`
                                }}
                              >
                                {num}
                              </div>
                              <p className="text-lg sm:text-xl lg:text-2xl font-semibold pt-1.5 sm:pt-2 leading-relaxed font-serif" style={{ color: colors.text }}>
                                {renderInline(body)}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Subtópico com letra - MELHORADO
                      if (isLetterTopic) {
                        const letter = detect.charAt(0).toUpperCase();
                        const body = display.replace(/^[a-zA-Z][\.\)]\s*/, "");
                        return (
                          <div key={i} className="ml-5 sm:ml-10 mb-4">
                            <div 
                              className="flex items-start gap-4 sm:gap-5 py-3 border-l-3 pl-5 sm:pl-6 rounded-r-lg"
                              style={{ 
                                borderColor: colors.accentSecondary,
                                backgroundColor: `${colors.accentSecondary}08`
                              }}
                            >
                              <span 
                                className="font-bold text-lg sm:text-xl shrink-0 font-serif w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ 
                                  color: "white",
                                  background: `linear-gradient(135deg, ${colors.accentSecondary}, ${colors.accent})`
                                }}
                              >
                                {letter}
                              </span>
                              <p className="text-base sm:text-lg lg:text-xl leading-relaxed pt-0.5" style={{ color: colors.text }}>
                                {renderInline(body)}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Bullet point - MELHORADO
                      if (isBulletPoint) {
                        const body = display.replace(/^[-•]\s*/, "");
                        return (
                          <div key={i} className="ml-5 sm:ml-10 mb-3 sm:mb-4">
                            <div className="flex items-start gap-4">
                              <span 
                                className="text-xl sm:text-2xl mt-0.5 shrink-0"
                                style={{ color: colors.highlight }}
                              >
                                ▸
                              </span>
                              <p className="text-base sm:text-lg lg:text-xl leading-relaxed" style={{ color: colors.textMuted }}>
                                {renderInline(body)}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Citação bíblica - MELHORADO
                      if (hasBibleRef && detect.length < 200 && detect.includes('"')) {
                        return (
                          <blockquote key={i} className="my-8 sm:my-10 mx-3 sm:mx-6 relative">
                            <div 
                              className="absolute -left-2 -top-2 text-6xl sm:text-7xl font-serif leading-none select-none opacity-30" 
                              style={{ color: colors.quote }}
                            >
                              "
                            </div>
                            <div 
                              className="pl-8 sm:pl-10 pr-5 py-5 sm:py-6 border-l-4 rounded-xl italic relative overflow-hidden"
                              style={{ 
                                borderColor: colors.quote,
                                backgroundColor: `${colors.quote}10`,
                                boxShadow: `inset 0 0 30px ${colors.quote}05`
                              }}
                            >
                              <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed font-serif relative z-10" style={{ color: colors.text }}>
                                {renderInline(display)}
                              </p>
                            </div>
                          </blockquote>
                        );
                      }

                      // Parágrafo normal - MELHORADO
                      const textAlign = align ?? "justify";
                      const textIndent = textAlign === "justify" ? "2em" : undefined;

                      return (
                        <p
                          key={i}
                          className="text-base sm:text-lg lg:text-xl leading-[2] sm:leading-[2.1] hyphens-auto first-letter:text-2xl first-letter:font-serif first-letter:font-bold"
                          style={{ 
                            textAlign, 
                            textIndent, 
                            color: colors.textMuted,
                          }}
                        >
                          {renderInline(display)}
                        </p>
                      );
                    })}
                  </div>
                  
                  {/* Rodapé da página - MELHORADO */}
                  <div className="mt-14 sm:mt-18 pt-8 border-t-2" style={{ borderColor: `${colors.accent}20` }}>
                    <div className="flex items-center justify-center gap-4">
                      <div className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${colors.accent}30)` }} />
                      <span 
                        className="text-sm font-medium px-4 py-2 rounded-full"
                        style={{ 
                          color: colors.accent,
                          backgroundColor: `${colors.accent}10`,
                          border: `1px solid ${colors.accent}20`
                        }}
                      >
                        Página {currentPage} de {totalPages}
                      </span>
                      <div className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${colors.accent}30)` }} />
                    </div>
                  </div>
                  
                  <div className="h-20" />
                </article>
              </ScrollArea>

              {/* Navegação de páginas */}
              {totalPages > 1 && (
                <footer 
                  className="shrink-0 border-t px-4 sm:px-6 py-3"
                  style={{ borderColor: `${colors.accent}25`, backgroundColor: colors.cardBg }}
                >
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="gap-2 disabled:opacity-30"
                      style={{ color: colors.accent }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Anterior</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      {pages.map((_, idx) => {
                        const pageNum = idx + 1;
                        const isNearCurrent = Math.abs(pageNum - currentPage) <= 1;
                        const isFirstOrLast = pageNum === 1 || pageNum === totalPages;
                        
                        if (!isNearCurrent && !isFirstOrLast) {
                          if (pageNum === 2 && currentPage > 3) {
                            return <span key={idx} className="px-1 text-xs" style={{ color: `${colors.accent}50` }}>…</span>;
                          }
                          if (pageNum === totalPages - 1 && currentPage < totalPages - 2) {
                            return <span key={idx} className="px-1 text-xs" style={{ color: `${colors.accent}50` }}>…</span>;
                          }
                          return null;
                        }
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => goToPage(pageNum)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium transition-all"
                            style={{
                              backgroundColor: pageNum === currentPage ? colors.accent : "transparent",
                              color: pageNum === currentPage ? "white" : `${colors.accent}90`,
                              boxShadow: pageNum === currentPage ? "0 2px 8px rgba(0,0,0,0.15)" : "none"
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="gap-2 disabled:opacity-30"
                      style={{ color: colors.accent }}
                    >
                      <span className="hidden sm:inline text-sm">Próxima</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </footer>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ backgroundColor: colors.bg, color: colors.textMuted }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.accent}15` }}>
                <BookOpen className="w-8 h-8" style={{ color: `${colors.accent}60` }} />
              </div>
              <p className="text-sm font-medium">Conteúdo não disponível</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
