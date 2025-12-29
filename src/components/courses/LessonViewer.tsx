import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Download, Printer, X, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

interface LessonViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string | null;
  loading?: boolean;
  category?: string;
}

// Função para limpar e formatar o conteúdo
function formatContent(text: string): { html: string; toc: { id: string; title: string; level: number }[] } {
  if (!text) return { html: "", toc: [] };

  const lines = text.split('\n');
  const htmlParts: string[] = [];
  const toc: { id: string; title: string; level: number }[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let currentParagraph: string[] = [];
  let sectionCount = 0;
  let skipSection = false;
  let inHeaderSection = true;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        // Destaca versículos bíblicos
        const formatted = text.replace(
          /\(([1-3]?\s?[A-ZÁ][a-záéíóúâêôã]+\.?\s+\d+[:\.\,]\d+(?:\-\d+)?)\)/g,
          '<em class="text-primary/80">($1)</em>'
        );
        htmlParts.push(`<p class="mb-4 leading-relaxed">${formatted}</p>`);
      }
      currentParagraph = [];
    }
  };

  const closeList = () => {
    if (inList) {
      htmlParts.push(`</${listType}>`);
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/^\d+:\s*/, '').trim();
    
    // Ignora linhas vazias de números de página
    if (line.match(/^[\d]+$/) && line.length <= 4) continue;
    if (line.match(/^página\s*\d+/i)) continue;
    
    const lowerLine = line.toLowerCase();

    // Detectar fim do cabeçalho institucional
    if (inHeaderSection) {
      if (
        lowerLine.match(/^(introdução|conceito|capítulo|lição|sumário)/i) ||
        line.match(/^[IVX]+[\.\-\)]\s+/) ||
        (line.match(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇÑ\s]{15,}$/) && 
         !lowerLine.includes('curso') && 
         !lowerLine.includes('seminário') && 
         !lowerLine.includes('disciplina'))
      ) {
        inHeaderSection = false;
      } else {
        continue;
      }
    }

    // Ignorar cabeçalhos institucionais
    if (
      lowerLine.includes('curso superior') ||
      lowerLine.includes('seminário') ||
      lowerLine.includes('disciplina:') ||
      lowerLine.includes('professor:') ||
      lowerLine.includes('carga horária')
    ) continue;

    // Pular seções de referências
    if (
      lowerLine.includes('referência bibliográfica') ||
      lowerLine.includes('bibliografia') ||
      lowerLine.match(/^referências?\s*$/)
    ) {
      skipSection = true;
      continue;
    }

    if (skipSection && line.match(/^[IVX]+[\.\-\)]\s+/)) {
      skipSection = false;
    }
    if (skipSection) continue;

    // Remover URLs, ISBN
    if (line.match(/https?:\/\/|www\./)) continue;
    if (lowerLine.includes('isbn')) continue;
    if (lowerLine.startsWith('fonte:')) continue;

    // Linha vazia
    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    // Títulos principais em maiúsculas (INTRODUÇÃO, CONCEITO, etc.)
    if (line.match(/^(CONCEITO|INTRODUÇÃO|CONCLUSÃO|CONSIDERAÇÕES)/i)) {
      flushParagraph();
      closeList();
      sectionCount++;
      const id = `section-${sectionCount}`;
      toc.push({ id, title: line.charAt(0) + line.slice(1).toLowerCase(), level: 1 });
      htmlParts.push(`<h2 id="${id}" class="text-2xl font-serif font-bold text-foreground mt-8 mb-4 pb-2 border-b border-border scroll-mt-20">${line.charAt(0) + line.slice(1).toLowerCase()}</h2>`);
      continue;
    }

    // Títulos em maiúsculas (mais de 15 caracteres)
    if (line.match(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇÑ\s]{15,}$/) && !line.includes('.') && line.length < 80) {
      flushParagraph();
      closeList();
      sectionCount++;
      const id = `section-${sectionCount}`;
      const title = line.charAt(0) + line.slice(1).toLowerCase();
      toc.push({ id, title, level: 2 });
      htmlParts.push(`<h3 id="${id}" class="text-xl font-serif font-semibold text-foreground mt-6 mb-3 scroll-mt-20">${title}</h3>`);
      continue;
    }

    // Números romanos (I., II., III.)
    if (line.match(/^[IVXLC]+[\.\-\)]\s+/i)) {
      flushParagraph();
      closeList();
      sectionCount++;
      const id = `section-${sectionCount}`;
      const content = line.replace(/^[IVXLC]+[\.\-\)]\s+/i, '');
      toc.push({ id, title: content, level: 2 });
      htmlParts.push(`<h3 id="${id}" class="text-lg font-serif font-semibold text-foreground mt-6 mb-3 flex items-center gap-2 scroll-mt-20">
        <span class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">${line.match(/^[IVXLC]+/i)?.[0]}</span>
        ${content}
      </h3>`);
      continue;
    }

    // Títulos numerados curtos
    if (line.match(/^\d+[\.\-\)]\s+/) && line.length < 80 && !line.match(/^\d+[\.\-\)]\s+[a-z]/)) {
      flushParagraph();
      closeList();
      const content = line.replace(/^\d+[\.\-\)]\s+/, '');
      const num = line.match(/^\d+/)?.[0];
      htmlParts.push(`<h4 class="text-base font-semibold text-foreground mt-4 mb-2 flex items-center gap-2">
        <span class="w-6 h-6 rounded bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">${num}</span>
        ${content}
      </h4>`);
      continue;
    }

    // Listas com letras ou bullets
    if (line.match(/^[a-z]\)\s+/i) || line.match(/^[\-•►▸◆]\s+/)) {
      flushParagraph();
      if (!inList || listType !== 'ul') {
        closeList();
        htmlParts.push('<ul class="list-none space-y-2 mb-4 pl-4">');
        inList = true;
        listType = 'ul';
      }
      const content = line.replace(/^[a-z]\)\s+|^[\-•►▸◆]\s+/i, '');
      htmlParts.push(`<li class="flex items-start gap-2">
        <span class="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></span>
        <span>${content}</span>
      </li>`);
      continue;
    }

    // Citações/versículos
    const bibleRefPattern = /([1-3]?\s?[A-ZÁ][a-záéíóúâêôã]+\.?\s+\d+[:\.\,]\d+(?:\-\d+)?)/;
    if (line.match(bibleRefPattern) && line.length < 300 && (line.startsWith('"') || line.includes(':'))) {
      flushParagraph();
      closeList();
      const formatted = line.replace(bibleRefPattern, '<strong class="text-primary">$1</strong>');
      htmlParts.push(`<blockquote class="border-l-4 border-primary/50 pl-4 py-2 my-4 bg-primary/5 rounded-r-lg italic text-muted-foreground">${formatted}</blockquote>`);
      continue;
    }

    // Parágrafo normal
    closeList();
    currentParagraph.push(line);
    
    if (line.match(/[.!?]$/)) {
      flushParagraph();
    }
  }

  flushParagraph();
  closeList();

  return { html: htmlParts.join('\n'), toc };
}

export function LessonViewer({ open, onOpenChange, title, content, loading, category }: LessonViewerProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { html, toc } = useMemo(() => formatContent(content || ''), [content]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setShowScrollTop(target.scrollTop > 300);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.8; }
            h1 { font-size: 28px; border-bottom: 2px solid #5c2d3d; padding-bottom: 10px; }
            h2 { font-size: 22px; margin-top: 30px; color: #5c2d3d; }
            h3 { font-size: 18px; margin-top: 25px; }
            h4 { font-size: 16px; margin-top: 20px; }
            p { text-align: justify; margin-bottom: 15px; }
            blockquote { border-left: 3px solid #5c2d3d; padding-left: 15px; font-style: italic; color: #666; }
            ul { list-style: disc; padding-left: 25px; }
            li { margin-bottom: 8px; }
            .badge { display: inline-block; background: #f0e6ea; color: #5c2d3d; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <span class="badge">${category || 'Material de Estudo'}</span>
          <h1>${title}</h1>
          ${html}
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-serif text-foreground">{title || "Material"}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                  {category || "Material de Estudo"} • Leia com atenção
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} disabled={loading || !content}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Table of Contents - Desktop */}
          {toc.length > 0 && !loading && (
            <aside className="hidden lg:block w-64 border-r border-border bg-muted/30 overflow-auto">
              <div className="p-4 sticky top-0">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Índice</h4>
                <nav className="space-y-1">
                  {toc.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors hover:bg-primary/10 hover:text-primary ${
                        item.level === 1 ? 'font-medium' : 'pl-4 text-muted-foreground'
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1 relative">
            {loading ? (
              <div className="flex-1 h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Carregando conteúdo...</p>
                </div>
              </div>
            ) : content ? (
              <ScrollArea 
                className="h-full" 
                onScrollCapture={handleScroll}
                ref={scrollRef}
              >
                <article className="max-w-3xl mx-auto px-6 py-8">
                  {/* Category Badge */}
                  <Badge variant="secondary" className="mb-4">
                    {category || "Material de Estudo"}
                  </Badge>
                  
                  {/* Title */}
                  <h1 className="text-3xl font-serif font-bold text-foreground mb-6 pb-4 border-b border-border">
                    {title}
                  </h1>

                  {/* Formatted Content */}
                  <div 
                    className="prose prose-lg max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </article>
              </ScrollArea>
            ) : (
              <div className="flex-1 h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum conteúdo disponível</p>
                </div>
              </div>
            )}

            {/* Scroll to Top Button */}
            {showScrollTop && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-4 right-4 rounded-full shadow-lg animate-fade-in"
                onClick={scrollToTop}
              >
                <ChevronUp className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}