import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, X, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

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
  const blocks: string[] = [];
  let currentBlock = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const nextLine = lines[i + 1]?.trim() || "";
    
    // Linha vazia = separador de parágrafo
    if (!trimmed) {
      if (currentBlock.trim()) {
        blocks.push(currentBlock.trim());
        currentBlock = "";
      }
      continue;
    }

    // Se é um título/cabeçalho, fecha bloco anterior e inicia novo
    if (isHeadingLine(trimmed) && (!currentBlock || !isIncompleteLine(currentBlock))) {
      if (currentBlock.trim()) {
        blocks.push(currentBlock.trim());
      }
      currentBlock = trimmed;
      // Se a próxima linha é vazia ou outro título, fecha este bloco
      if (!nextLine || isHeadingLine(nextLine)) {
        blocks.push(currentBlock.trim());
        currentBlock = "";
      }
      continue;
    }

    // Adiciona ao bloco atual
    if (currentBlock) {
      // Junta linhas com espaço se a anterior terminou incompleta
      currentBlock += " " + trimmed;
    } else {
      currentBlock = trimmed;
    }
  }

  if (currentBlock.trim()) {
    blocks.push(currentBlock.trim());
  }

  return blocks.filter((b) => b.trim());
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
      <DialogContent className="!fixed !inset-0 !max-w-none !w-screen !h-screen !translate-x-0 !translate-y-0 !left-0 !top-0 flex flex-col p-0 gap-0 bg-background overflow-hidden !rounded-none border-none">
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
        <div className="flex-1 overflow-hidden flex bg-muted/30">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando conteúdo...</p>
            </div>
          ) : content ? (
            <div className="flex-1 flex flex-col">
              {/* Área de leitura */}
              <ScrollArea className="flex-1">
                <article className="w-full max-w-5xl mx-auto px-6 sm:px-10 lg:px-14 py-10 sm:py-14">
                  {/* Cabeçalho na primeira página */}
                  {currentPage === 1 && (
                    <div className="text-center mb-14 pb-8 border-b-2 border-primary/20">
                      <p className="text-xs uppercase tracking-[0.2em] text-primary/60 mb-4 font-medium">
                        {category}
                      </p>
                      <h1 className="text-2xl sm:text-4xl font-serif font-bold text-foreground leading-snug">
                        {title}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-4">
                        P.O.D Seminário Teológico
                      </p>
                    </div>
                  )}
                  
                  {/* Texto com separação clara de tópicos */}
                  <div className="space-y-5">
                    {splitIntoBlocks(pages[currentPage - 1] || "").map((block, i) => {
                      const t = block.trim();
                      if (!t) return null;

                      // Detecta diferentes tipos de cabeçalhos (apenas se for linha curta e maiúscula)
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
                          <section key={i} className="mt-10 first:mt-0">
                            <div className="bg-primary/5 rounded-xl p-5 border-l-4 border-primary">
                              <h2 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold text-primary">
                                {t}
                              </h2>
                            </div>
                          </section>
                        );
                      }

                      // Subtópico numerado (I. II. III. ou 1. 2. 3.)
                      if (isNumberedTopic) {
                        return (
                          <div key={i} className="mt-6 mb-3">
                            <div className="flex items-start gap-4 bg-muted/50 rounded-lg p-4">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-primary font-bold text-sm">
                                  {t.match(/^([IVX\d]+)/)?.[1]}
                                </span>
                              </div>
                              <p className="text-base sm:text-lg lg:text-xl font-semibold text-foreground pt-1 whitespace-pre-wrap">
                                {t.replace(/^[IVX\d]+[\.\)]\s*/, "")}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Subtópico com letra (a. b. c.)
                      if (isLetterTopic) {
                        return (
                          <div key={i} className="ml-4 mb-2">
                            <div className="flex items-start gap-3 pl-4 border-l-2 border-accent/50">
                              <span className="text-primary font-semibold shrink-0">{t.charAt(0)}.</span>
                              <p className="text-base sm:text-lg text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                {t.replace(/^[a-zA-Z][\.\)]\s*/, "")}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Bullet point
                      if (isBulletPoint) {
                        return (
                          <div key={i} className="ml-4 mb-2">
                            <div className="flex items-start gap-3">
                              <span className="text-primary mt-1.5 shrink-0">•</span>
                              <p className="text-base sm:text-lg text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                {t.replace(/^[-•]\s*/, "")}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Parágrafo normal - preserva quebras internas
                      return (
                        <p
                          key={i}
                          className="text-base sm:text-lg text-foreground/90 leading-[1.8] sm:leading-[1.9] whitespace-pre-wrap"
                        >
                          {t}
                        </p>
                      );
                    })}
                  </div>
                  
                  {/* Espaço extra no final */}
                  <div className="h-16" />
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
