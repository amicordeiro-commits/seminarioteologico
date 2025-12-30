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

function renderInline(text: string): ReactNode {
  if (!text) return null;

  const nodes: ReactNode[] = [];
  let remaining = text;

  const patterns = [
    { type: "span" as const, re: /<span style="([^"]+)">([\s\S]*?)<\/span>/ },
    { type: "u" as const, re: /<u>([\s\S]*?)<\/u>/ },
    { type: "bold" as const, re: /\*\*([\s\S]+?)\*\*/ },
    { type: "italic" as const, re: /\*(?!\*)([\s\S]+?)\*(?!\*)/ },
  ];

  while (remaining.length) {
    let best:
      | { type: (typeof patterns)[number]["type"]; index: number; match: RegExpMatchArray; re: RegExp }
      | null = null;

    for (const p of patterns) {
      const m = remaining.match(p.re);
      if (!m || m.index == null) continue;
      if (!best || m.index < best.index) best = { type: p.type, index: m.index, match: m, re: p.re };
    }

    if (!best) {
      nodes.push(remaining);
      break;
    }

    if (best.index > 0) nodes.push(remaining.slice(0, best.index));

    const full = best.match[0];

    if (best.type === "span") {
      const style = parseSpanStyle(best.match[1]);
      const inner = best.match[2] ?? "";
      nodes.push(
        <span key={nodes.length} style={style}>
          {renderInline(inner)}
        </span>,
      );
    } else if (best.type === "u") {
      const inner = best.match[1] ?? "";
      nodes.push(
        <u key={nodes.length} className="decoration-primary/50 underline-offset-4">
          {renderInline(inner)}
        </u>,
      );
    } else if (best.type === "bold") {
      const inner = best.match[1] ?? "";
      nodes.push(
        <strong key={nodes.length} className="font-bold">
          {renderInline(inner)}
        </strong>,
      );
    } else if (best.type === "italic") {
      const inner = best.match[1] ?? "";
      nodes.push(
        <em key={nodes.length} className="italic">
          {renderInline(inner)}
        </em>,
      );
    }

    remaining = remaining.slice(best.index + full.length);
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

  // Cores baseadas no modo
  const colors = nightMode
    ? {
        bg: "#1a1612",
        headerBg: "linear-gradient(135deg, #3d2914 0%, #2d1f0f 100%)",
        text: "#d4c4b0",
        textMuted: "#a89880",
        accent: "#c9a66b",
        cardBg: "#241e18",
        border: "rgba(201, 166, 107, 0.15)",
      }
    : {
        bg: "#faf8f5",
        headerBg: "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
        text: "#3d2914",
        textMuted: "#6b5a48",
        accent: "#8B4513",
        cardBg: "#f5f0e8",
        border: "rgba(139, 69, 19, 0.15)",
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
                  {/* Cabeçalho na primeira página */}
                  {currentPage === 1 && (
                    <div className="mb-12 sm:mb-16 pb-8 sm:pb-10 border-b-2" style={{ borderColor: `${colors.accent}30` }}>
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${colors.accent}40)` }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${colors.accent}40` }} />
                        <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${colors.accent}40)` }} />
                      </div>
                      
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-4 font-semibold text-center" style={{ color: `${colors.accent}90` }}>
                        {category || "Disciplina"}
                      </p>
                      
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight text-center mb-5" style={{ color: colors.text }}>
                        {title}
                      </h1>
                      
                      <div className="flex items-center justify-center gap-2 text-xs" style={{ color: `${colors.accent}80` }}>
                        <span className="font-medium">P.O.D Seminário Teológico</span>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <div className="h-px w-20" style={{ backgroundColor: `${colors.accent}25` }} />
                        <div className="text-lg" style={{ color: `${colors.accent}40` }}>✦</div>
                        <div className="h-px w-20" style={{ backgroundColor: `${colors.accent}25` }} />
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

                      // Título principal
                      if (isMainHeading) {
                        return (
                          <section key={i} className="mt-10 sm:mt-12 first:mt-0">
                            <div className="relative py-4 sm:py-5">
                              <div 
                                className="absolute left-0 top-0 bottom-0 w-1 rounded-full" 
                                style={{ background: `linear-gradient(to bottom, ${colors.accent}, ${colors.accent}80)` }} 
                              />
                              <h2 className="pl-5 sm:pl-6 text-lg sm:text-xl lg:text-2xl font-serif font-bold leading-snug tracking-wide" style={{ color: colors.text }}>
                                {renderInline(display)}
                              </h2>
                            </div>
                          </section>
                        );
                      }

                      // Subtópico numerado
                      if (isNumberedTopic) {
                        const num = detect.match(/^([IVX\d]+)/)?.[1];
                        const body = display.replace(/^[IVX\d]+[\.\)]\s*/, "");
                        return (
                          <div key={i} className="mt-6 sm:mt-8 mb-3 sm:mb-4">
                            <div 
                              className="flex items-start gap-3 sm:gap-4 rounded-lg p-4 sm:p-5 border"
                              style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
                            >
                              <div 
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center shrink-0 shadow-md"
                                style={{ backgroundColor: colors.accent }}
                              >
                                <span className="font-bold text-xs sm:text-sm font-serif">{num}</span>
                              </div>
                              <p className="text-base sm:text-lg lg:text-xl font-semibold pt-1 sm:pt-1.5 leading-relaxed font-serif" style={{ color: colors.text }}>
                                {renderInline(body)}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Subtópico com letra
                      if (isLetterTopic) {
                        const letter = detect.charAt(0).toUpperCase();
                        const body = display.replace(/^[a-zA-Z][\.\)]\s*/, "");
                        return (
                          <div key={i} className="ml-4 sm:ml-8 mb-3">
                            <div className="flex items-start gap-3 sm:gap-4 py-2 border-l-2 pl-4 sm:pl-5" style={{ borderColor: `${colors.accent}50` }}>
                              <span className="font-bold text-base sm:text-lg shrink-0 font-serif" style={{ color: colors.accent }}>{letter}.</span>
                              <p className="text-sm sm:text-base lg:text-lg leading-relaxed" style={{ color: colors.textMuted }}>
                                {renderInline(body)}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Bullet point
                      if (isBulletPoint) {
                        const body = display.replace(/^[-•]\s*/, "");
                        return (
                          <div key={i} className="ml-4 sm:ml-8 mb-2 sm:mb-3">
                            <div className="flex items-start gap-3">
                              <span className="text-lg sm:text-xl mt-0.5 shrink-0" style={{ color: colors.accent }}>•</span>
                              <p className="text-sm sm:text-base lg:text-lg leading-relaxed" style={{ color: colors.textMuted }}>
                                {renderInline(body)}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Citação bíblica
                      if (hasBibleRef && detect.length < 200 && detect.includes('"')) {
                        return (
                          <blockquote key={i} className="my-6 sm:my-8 mx-2 sm:mx-4 relative">
                            <div className="absolute left-0 top-0 text-4xl sm:text-5xl font-serif leading-none select-none" style={{ color: `${colors.accent}30` }}>"</div>
                            <div 
                              className="pl-6 sm:pl-8 pr-4 py-3 sm:py-4 border-l-4 rounded-r-lg italic"
                              style={{ borderColor: `${colors.accent}60`, backgroundColor: `${colors.cardBg}80` }}
                            >
                              <p className="text-base sm:text-lg lg:text-xl leading-relaxed font-serif" style={{ color: colors.text }}>
                                {renderInline(display)}
                              </p>
                            </div>
                          </blockquote>
                        );
                      }

                      // Parágrafo normal
                      const textAlign = align ?? "justify";
                      const textIndent = textAlign === "justify" ? "1.5em" : undefined;

                      return (
                        <p
                          key={i}
                          className="text-sm sm:text-base lg:text-lg leading-[1.85] sm:leading-[1.95] hyphens-auto"
                          style={{ textAlign, textIndent, color: colors.textMuted }}
                        >
                          {renderInline(display)}
                        </p>
                      );
                    })}
                  </div>
                  
                  {/* Rodapé da página */}
                  <div className="mt-12 sm:mt-16 pt-6 border-t" style={{ borderColor: `${colors.accent}15` }}>
                    <div className="flex items-center justify-center">
                      <span className="text-xs font-medium" style={{ color: `${colors.accent}60` }}>
                        — Página {currentPage} de {totalPages} —
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-16" />
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
