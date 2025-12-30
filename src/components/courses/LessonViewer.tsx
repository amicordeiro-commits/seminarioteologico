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
  // Remove caracteres de controle exceto \n e \t
  let t = text.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, "");
  // Normaliza diferentes tipos de quebra de linha
  t = t.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Remove espaços em branco no final das linhas
  t = t.replace(/[ \t]+$/gm, "");
  return t.trim();
}

// Verifica se uma linha parece ser um título/cabeçalho
function isHeadingLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  // Linha curta toda em maiúsculas
  if (/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,.()]+$/.test(t) && t.length < 80) return true;
  // Numeração romana ou numérica
  if (/^[IVX]+[\.\)]\s/.test(t) || /^\d+[\.\)]\s/.test(t)) return true;
  // Subtópico com letra
  if (/^[a-zA-Z][\.\)]\s/.test(t) && t.length < 100) return true;
  // Bullet point
  if (/^[-•]\s/.test(t)) return true;
  return false;
}

// Verifica se uma linha termina de forma incompleta (sem pontuação final)
function isIncompleteLine(line: string): boolean {
  const t = line.trim();
  if (!t || t.length < 20) return false;
  // Termina com pontuação final = completa
  if (/[.!?:;]$/.test(t)) return false;
  // Termina com parêntese fechando referência bíblica = completa
  if (/\)$/.test(t) && /\([A-Z][a-z]+ \d/.test(t)) return false;
  return true;
}

// Divide texto em blocos lógicos, juntando linhas quebradas artificialmente
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

    // Linha vazia = separador (pode ser parágrafo OU quebra artificial, vamos tratar depois)
    if (!trimmed) {
      pushCurrent();
      continue;
    }

    // Se é um título/cabeçalho, fecha bloco anterior e inicia novo
    if (isHeadingLine(trimmed) && (!currentBlock || !isIncompleteLine(currentBlock))) {
      pushCurrent();
      currentBlock = trimmed;
      if (!nextLine || isHeadingLine(nextLine)) pushCurrent();
      continue;
    }

    if (currentBlock) {
      // Hifenização de quebra de linha (ex: teolo-\ngia)
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

  // Pós-processamento: une blocos separados por linhas vazias “artificiais”
  const merged: string[] = [];
  for (const b of rawBlocks) {
    const prev = merged[merged.length - 1];
    if (!prev) {
      merged.push(b);
      continue;
    }

    const bTrim = b.trim();
    const startsLikeContinuation = /^[a-záàâãçéêíóôõúü(“"']/.test(bTrim);
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

// Simple content splitting - fast and lightweight
function splitIntoPages(text: string, charsPerPage = 4500): string[] {
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
        <u key={nodes.length}>
          {renderInline(inner)}
        </u>,
      );
    } else if (best.type === "bold") {
      const inner = best.match[1] ?? "";
      nodes.push(
        <strong key={nodes.length}>
          {renderInline(inner)}
        </strong>,
      );
    } else if (best.type === "italic") {
      const inner = best.match[1] ?? "";
      nodes.push(
        <em key={nodes.length}>
          {renderInline(inner)}
        </em>,
      );
    }

    remaining = remaining.slice(best.index + full.length);
  }

  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
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
      <DialogContent className="!fixed !inset-0 !max-w-none !w-screen !h-screen !translate-x-0 !translate-y-0 !left-0 !top-0 flex flex-col p-0 gap-0 bg-[hsl(35,30%,96%)] dark:bg-[hsl(20,25%,8%)] overflow-hidden !rounded-none border-none">
        {/* Header elegante */}
        <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif font-semibold text-base sm:text-lg truncate">{title}</h2>
              {category && <p className="text-xs opacity-80">{category}</p>}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </header>

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-hidden flex">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando conteúdo...</p>
            </div>
          ) : content ? (
            <div className="flex-1 flex flex-col">
              {/* Área de leitura */}
              <ScrollArea className="flex-1">
                <article className="w-full max-w-4xl mx-auto px-6 sm:px-12 lg:px-16 py-12 sm:py-16">
                  {/* Cabeçalho na primeira página */}
                  {currentPage === 1 && (
                    <div className="text-center mb-16 pb-10 border-b border-primary/20">
                      <p className="text-xs uppercase tracking-[0.25em] text-primary/70 mb-5 font-semibold">
                        {category}
                      </p>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight">
                        {title}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-5 font-medium">
                        P.O.D Seminário Teológico
                      </p>
                    </div>
                  )}
                  
                  {/* Texto com formatação melhorada */}
                  <div className="space-y-6">
                    {splitIntoBlocks(pages[currentPage - 1] || "").map((block, i) => {
                      const t = block.trim();
                      if (!t) return null;

                      // Detecta diferentes tipos de cabeçalhos
                      const isMainHeading =
                        /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,.()]+$/.test(t) &&
                        t.length < 80 &&
                        !t.includes(".");
                      const isNumberedTopic = /^[IVX]+[\.\)]\s/.test(t) || /^\d+[\.\)]\s/.test(t);
                      const isLetterTopic = /^[a-zA-Z][\.\)]\s/.test(t) && t.length < 200;
                      const isBulletPoint = /^[-•]\s/.test(t);

                      // Título principal do tópico
                      if (isMainHeading) {
                        return (
                          <section key={i} className="mt-12 first:mt-0">
                            <div className="bg-primary/8 dark:bg-primary/15 rounded-xl p-6 border-l-4 border-primary shadow-sm">
                              <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-primary leading-snug">
                                {t}
                              </h2>
                            </div>
                          </section>
                        );
                      }

                      // Subtópico numerado (I. II. III. ou 1. 2. 3.)
                      if (isNumberedTopic) {
                        return (
                          <div key={i} className="mt-8 mb-4">
                            <div className="flex items-start gap-4 bg-muted/60 dark:bg-muted/30 rounded-xl p-5 border border-border/50">
                              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                                <span className="text-primary font-bold text-base font-serif">
                                  {t.match(/^([IVX\d]+)/)?.[1]}
                                </span>
                              </div>
                              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground pt-1.5 leading-relaxed whitespace-pre-wrap font-serif">
                                {t.replace(/^[IVX\d]+[\.\)]\s*/, "")}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Subtópico com letra (a. b. c.)
                      if (isLetterTopic) {
                        return (
                          <div key={i} className="ml-6 mb-3">
                            <div className="flex items-start gap-4 pl-5 border-l-2 border-accent/60 py-1">
                              <span className="text-primary font-bold text-lg shrink-0 font-serif">{t.charAt(0)}.</span>
                              <p className="text-base sm:text-lg lg:text-xl text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                {t.replace(/^[a-zA-Z][\.\)]\s*/, "")}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Bullet point
                      if (isBulletPoint) {
                        return (
                          <div key={i} className="ml-6 mb-3">
                            <div className="flex items-start gap-4">
                              <span className="text-primary text-xl mt-0.5 shrink-0">•</span>
                              <p className="text-base sm:text-lg lg:text-xl text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                {t.replace(/^[-•]\s*/, "")}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Parágrafo normal - texto principal
                      return (
                        <p
                          key={i}
                          className="text-base sm:text-lg lg:text-xl text-foreground/85 leading-[1.9] sm:leading-[2] whitespace-pre-wrap first-letter:text-2xl first-letter:font-serif first-letter:font-bold first-letter:text-primary/80"
                          style={{ textAlign: 'justify', textIndent: '2em' }}
                        >
                          {t}
                        </p>
                      );
                    })}
                  </div>
                  
                  {/* Espaço extra no final */}
                  <div className="h-20" />
                </article>
              </ScrollArea>

              {/* Navegação de páginas - Fixa no rodapé */}
              {totalPages > 1 && (
                <footer className="shrink-0 border-t border-border bg-background px-6 py-3">
                  <div className="flex items-center justify-between max-w-3xl mx-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </Button>

                    {/* Indicador de páginas */}
                    <div className="flex items-center gap-1.5">
                      {pages.map((_, idx) => {
                        const pageNum = idx + 1;
                        const isNearCurrent = Math.abs(pageNum - currentPage) <= 2;
                        const isFirstOrLast = pageNum === 1 || pageNum === totalPages;
                        
                        if (!isNearCurrent && !isFirstOrLast) {
                          // Show ellipsis only once between gaps
                          if (pageNum === 2 && currentPage > 4) {
                            return <span key={idx} className="text-muted-foreground text-xs px-1">...</span>;
                          }
                          if (pageNum === totalPages - 1 && currentPage < totalPages - 3) {
                            return <span key={idx} className="text-muted-foreground text-xs px-1">...</span>;
                          }
                          return null;
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                              currentPage === pageNum
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
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
                      className="gap-2"
                    >
                      <span className="hidden sm:inline">Próxima</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </footer>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <BookOpen className="w-12 h-12 opacity-30" />
              <p className="text-sm">Conteúdo não disponível</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
