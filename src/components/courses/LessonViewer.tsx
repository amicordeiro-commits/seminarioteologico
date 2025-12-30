import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, X, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
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

// Verifica se uma linha parece ser um título/cabeçalho
function isHeadingLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,.()]+$/.test(t) && t.length < 80) return true;
  if (/^[IVX]+[\.\)]\s/.test(t) || /^\d+[\.\)]\s/.test(t)) return true;
  if (/^[a-zA-Z][\.\)]\s/.test(t) && t.length < 100) return true;
  if (/^[-•]\s/.test(t)) return true;
  return false;
}

// Verifica se uma linha termina de forma incompleta
function isIncompleteLine(line: string): boolean {
  const t = line.trim();
  if (!t || t.length < 20) return false;
  if (/[.!?:;]$/.test(t)) return false;
  if (/\)$/.test(t) && /\([A-Z][a-z]+ \d/.test(t)) return false;
  return true;
}

// Divide texto em blocos lógicos
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
        <strong key={nodes.length} className="font-bold text-foreground">
          {renderInline(inner)}
        </strong>,
      );
    } else if (best.type === "italic") {
      const inner = best.match[1] ?? "";
      nodes.push(
        <em key={nodes.length} className="italic text-foreground/90">
          {renderInline(inner)}
        </em>,
      );
    }

    remaining = remaining.slice(best.index + full.length);
  }

  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

// Detecta citações bíblicas no texto
function detectBibleReference(text: string): boolean {
  return /\([A-Za-záéíóúâêôãõç]+\s*\d+[:.]\d+(?:-\d+)?\)/.test(text) ||
         /[A-Za-záéíóúâêôãõç]+\s+\d+[:.]\d+(?:-\d+)?/.test(text);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [content]);

  const pages = useMemo(() => splitIntoPages(content || ""), [content]);
  const totalPages = Math.max(1, pages.length);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!fixed !inset-0 !max-w-none !w-screen !h-screen !translate-x-0 !translate-y-0 !left-0 !top-0 flex flex-col p-0 gap-0 bg-[#faf8f5] dark:bg-[#1a1815] overflow-hidden !rounded-none border-none">
        {/* Header elegante estilo livro */}
        <header className="flex items-center justify-between px-4 sm:px-8 py-3 bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#8B4513] text-white shrink-0 shadow-lg">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-sm sm:text-lg truncate tracking-wide">{title}</h2>
              {category && <p className="text-[10px] sm:text-xs opacity-75 font-medium uppercase tracking-wider">{category}</p>}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/20 h-9 w-9"
          >
            <X className="w-5 h-5" />
          </Button>
        </header>

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-hidden flex">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-[#faf8f5] dark:bg-[#1a1815]">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Carregando conteúdo...</p>
            </div>
          ) : content ? (
            <div className="flex-1 flex flex-col">
              {/* Área de leitura estilo livro/revista */}
              <ScrollArea className="flex-1 bg-[#faf8f5] dark:bg-[#1a1815]">
                <article className="w-full max-w-3xl mx-auto px-5 sm:px-10 lg:px-14 py-10 sm:py-14">
                  {/* Cabeçalho na primeira página - estilo editorial */}
                  {currentPage === 1 && (
                    <div className="mb-12 sm:mb-16 pb-8 sm:pb-10 border-b-2 border-[#8B4513]/20">
                      {/* Linha decorativa superior */}
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#8B4513]/40" />
                        <div className="w-2 h-2 rounded-full bg-[#8B4513]/30" />
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#8B4513]/40" />
                      </div>
                      
                      <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#8B4513]/70 mb-4 font-semibold text-center">
                        {category || "Disciplina"}
                      </p>
                      
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#3d2914] dark:text-[#d4c4b0] leading-tight text-center mb-5">
                        {title}
                      </h1>
                      
                      <div className="flex items-center justify-center gap-2 text-xs text-[#8B4513]/60">
                        <span className="font-medium">P.O.D Seminário Teológico</span>
                      </div>
                      
                      {/* Linha decorativa inferior */}
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <div className="h-px w-20 bg-[#8B4513]/20" />
                        <div className="text-[#8B4513]/30 text-lg">✦</div>
                        <div className="h-px w-20 bg-[#8B4513]/20" />
                      </div>
                    </div>
                  )}
                  
                  {/* Texto com formatação profissional */}
                  <div className="space-y-5 sm:space-y-6">
                    {splitIntoBlocks(pages[currentPage - 1] || "").map((block, i) => {
                      const raw = block.trim();
                      if (!raw) return null;

                      const unwrapped = unwrapTextAlignBlock(raw);
                      const align = unwrapped?.align;
                      const display = (unwrapped?.inner ?? raw).trim();
                      const detect = stripInlineMarkup(display).trim();

                      // Detecta diferentes tipos de conteúdo
                      const isMainHeading =
                        /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,.()]+$/.test(detect) &&
                        detect.length < 80 &&
                        !detect.includes(".");
                      const isNumberedTopic = /^[IVX]+[\.\)]\s/.test(detect) || /^\d+[\.\)]\s/.test(detect);
                      const isLetterTopic = /^[a-zA-Z][\.\)]\s/.test(detect) && detect.length < 200;
                      const isBulletPoint = /^[-•]\s/.test(detect);
                      const hasBibleRef = detectBibleReference(detect);

                      // Título principal - estilo editorial elegante
                      if (isMainHeading) {
                        return (
                          <section key={i} className="mt-10 sm:mt-12 first:mt-0">
                            <div className="relative py-4 sm:py-5">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8B4513] via-[#A0522D] to-[#8B4513] rounded-full" />
                              <h2 className="pl-5 sm:pl-6 text-lg sm:text-xl lg:text-2xl font-serif font-bold text-[#3d2914] dark:text-[#d4c4b0] leading-snug tracking-wide">
                                {renderInline(display)}
                              </h2>
                            </div>
                          </section>
                        );
                      }

                      // Subtópico numerado (I. II. III. ou 1. 2. 3.)
                      if (isNumberedTopic) {
                        const num = detect.match(/^([IVX\d]+)/)?.[1];
                        const body = display.replace(/^[IVX\d]+[\.\)]\s*/, "");
                        return (
                          <div key={i} className="mt-6 sm:mt-8 mb-3 sm:mb-4">
                            <div className="flex items-start gap-3 sm:gap-4 bg-[#f5f0e8] dark:bg-[#2a251f] rounded-lg p-4 sm:p-5 border border-[#8B4513]/10">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#8B4513] text-white flex items-center justify-center shrink-0 shadow-md">
                                <span className="font-bold text-xs sm:text-sm font-serif">{num}</span>
                              </div>
                              <p className="text-base sm:text-lg lg:text-xl font-semibold text-[#3d2914] dark:text-[#d4c4b0] pt-1 sm:pt-1.5 leading-relaxed font-serif">
                                {renderInline(body)}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Subtópico com letra (a. b. c.)
                      if (isLetterTopic) {
                        const letter = detect.charAt(0).toUpperCase();
                        const body = display.replace(/^[a-zA-Z][\.\)]\s*/, "");
                        return (
                          <div key={i} className="ml-4 sm:ml-8 mb-3">
                            <div className="flex items-start gap-3 sm:gap-4 py-2 border-l-2 border-[#8B4513]/30 pl-4 sm:pl-5">
                              <span className="text-[#8B4513] font-bold text-base sm:text-lg shrink-0 font-serif">{letter}.</span>
                              <p className="text-sm sm:text-base lg:text-lg text-[#4a3f35] dark:text-[#c4b8a8] leading-relaxed">
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
                              <span className="text-[#8B4513] text-lg sm:text-xl mt-0.5 shrink-0">•</span>
                              <p className="text-sm sm:text-base lg:text-lg text-[#4a3f35] dark:text-[#c4b8a8] leading-relaxed">
                                {renderInline(body)}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Citação bíblica - destaque especial
                      if (hasBibleRef && detect.length < 200 && detect.includes('"')) {
                        return (
                          <blockquote key={i} className="my-6 sm:my-8 mx-2 sm:mx-4 relative">
                            <div className="absolute left-0 top-0 text-4xl sm:text-5xl text-[#8B4513]/20 font-serif leading-none select-none">"</div>
                            <div className="pl-6 sm:pl-8 pr-4 py-3 sm:py-4 border-l-4 border-[#8B4513]/40 bg-[#f5f0e8]/50 dark:bg-[#2a251f]/50 rounded-r-lg italic">
                              <p className="text-base sm:text-lg lg:text-xl text-[#3d2914] dark:text-[#d4c4b0] leading-relaxed font-serif">
                                {renderInline(display)}
                              </p>
                            </div>
                          </blockquote>
                        );
                      }

                      // Parágrafo normal - tipografia editorial
                      const textAlign = align ?? "justify";
                      const textIndent = textAlign === "justify" ? "1.5em" : undefined;

                      return (
                        <p
                          key={i}
                          className="text-sm sm:text-base lg:text-lg text-[#4a3f35] dark:text-[#c4b8a8] leading-[1.85] sm:leading-[1.95] hyphens-auto"
                          style={{ textAlign, textIndent }}
                        >
                          {renderInline(display)}
                        </p>
                      );
                    })}
                  </div>
                  
                  {/* Rodapé da página com número */}
                  <div className="mt-12 sm:mt-16 pt-6 border-t border-[#8B4513]/10">
                    <div className="flex items-center justify-center">
                      <span className="text-xs text-[#8B4513]/50 font-medium">
                        — Página {currentPage} de {totalPages} —
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-16" />
                </article>
              </ScrollArea>

              {/* Navegação de páginas - Estilo elegante */}
              {totalPages > 1 && (
                <footer className="shrink-0 border-t border-[#8B4513]/20 bg-[#f5f0e8] dark:bg-[#1f1b17] px-4 sm:px-6 py-3">
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="gap-2 text-[#8B4513] hover:bg-[#8B4513]/10 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Anterior</span>
                    </Button>

                    {/* Indicador de páginas compacto */}
                    <div className="flex items-center gap-1">
                      {pages.map((_, idx) => {
                        const pageNum = idx + 1;
                        const isNearCurrent = Math.abs(pageNum - currentPage) <= 1;
                        const isFirstOrLast = pageNum === 1 || pageNum === totalPages;
                        
                        if (!isNearCurrent && !isFirstOrLast) {
                          if (pageNum === 2 && currentPage > 3) {
                            return <span key={idx} className="px-1 text-[#8B4513]/40 text-xs">…</span>;
                          }
                          if (pageNum === totalPages - 1 && currentPage < totalPages - 2) {
                            return <span key={idx} className="px-1 text-[#8B4513]/40 text-xs">…</span>;
                          }
                          return null;
                        }
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => goToPage(pageNum)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium transition-all ${
                              pageNum === currentPage
                                ? "bg-[#8B4513] text-white shadow-md"
                                : "text-[#8B4513]/70 hover:bg-[#8B4513]/15"
                            }`}
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
                      className="gap-2 text-[#8B4513] hover:bg-[#8B4513]/10 disabled:opacity-30"
                    >
                      <span className="hidden sm:inline text-sm">Próxima</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </footer>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground bg-[#faf8f5] dark:bg-[#1a1815]">
              <div className="w-16 h-16 rounded-full bg-[#8B4513]/10 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-[#8B4513]/50" />
              </div>
              <p className="text-sm font-medium">Conteúdo não disponível</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
