import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Download, X, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface LessonViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string | null;
  loading?: boolean;
  category?: string;
}

// Simple content splitting - fast and lightweight
function splitIntoPages(text: string, charsPerPage = 4500): string[] {
  if (!text) return [];
  
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  const pages: string[] = [];
  let currentPage = "";
  
  for (const p of paragraphs) {
    if (currentPage.length + p.length > charsPerPage && currentPage) {
      pages.push(currentPage.trim());
      currentPage = p;
    } else {
      currentPage += (currentPage ? "\n\n" : "") + p;
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

  const handleDownloadPDF = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>
        body{font-family:Georgia,serif;font-size:12pt;line-height:1.8;max-width:700px;margin:40px auto;padding:20px;color:#1a1a1a}
        h1{text-align:center;color:#7c2d12;border-bottom:2px solid #d4af37;padding-bottom:15px;margin-bottom:30px}
        h2{color:#7c2d12;margin-top:25px;border-left:3px solid #d4af37;padding-left:10px}
        p{text-align:justify;margin-bottom:12px}
        @media print{body{margin:0;padding:2cm}}
      </style></head><body>
      <h1>${title}</h1>
      <p style="text-align:center;color:#666;margin-bottom:30px">${category || "Material Didático"} • P.O.D Seminário Teológico</p>
      ${(content || "").split(/\n\n+/).map(p => {
        const t = p.trim();
        if (/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,.]+$/.test(t) && t.length < 80) return `<h2>${t}</h2>`;
        if (/^[IVX]+\.\s/.test(t)) return `<h2>${t}</h2>`;
        return `<p>${t}</p>`;
      }).join("")}
    </body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 300);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[92vh] flex flex-col p-0 gap-0 bg-background overflow-hidden">
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={loading || !content}
              className="text-primary-foreground hover:bg-primary-foreground/20 gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
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
                <article className="max-w-3xl mx-auto px-6 sm:px-10 py-8">
                  {/* Cabeçalho na primeira página */}
                  {currentPage === 1 && (
                    <div className="text-center mb-10 pb-6 border-b border-border">
                      <p className="text-xs uppercase tracking-widest text-primary/70 mb-3 font-medium">
                        {category}
                      </p>
                      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground leading-tight">
                        {title}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-3">
                        P.O.D Seminário Teológico
                      </p>
                    </div>
                  )}
                  
                  {/* Texto */}
                  <div className="prose prose-sm sm:prose-base max-w-none">
                    {pages[currentPage - 1]?.split(/\n\n+/).map((p, i) => {
                      const t = p.trim();
                      if (!t) return null;
                      
                      const isMainHeading = /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,.]+$/.test(t) && t.length < 80;
                      const isSubHeading = /^[IVX]+\.\s/.test(t) || /^\d+\.\s/.test(t);
                      
                      if (isMainHeading) {
                        return (
                          <h2 
                            key={i} 
                            className="text-lg sm:text-xl font-serif font-semibold text-primary mt-8 mb-4 pb-2 border-b border-primary/20"
                          >
                            {t}
                          </h2>
                        );
                      }
                      
                      if (isSubHeading) {
                        return (
                          <h3 
                            key={i} 
                            className="text-base sm:text-lg font-semibold text-foreground mt-6 mb-3 pl-4 border-l-3 border-accent"
                          >
                            {t}
                          </h3>
                        );
                      }
                      
                      return (
                        <p 
                          key={i} 
                          className="text-foreground leading-relaxed text-justify mb-4 text-sm sm:text-base"
                        >
                          {t}
                        </p>
                      );
                    })}
                  </div>
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
