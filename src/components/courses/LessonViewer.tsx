import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Download, X, BookOpen, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface LessonViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string | null;
  loading?: boolean;
  category?: string;
}

// Pre-process text: normalize line breaks and split properly
function preprocessContent(raw: string): string[] {
  if (!raw) return [];

  // Normalize line breaks
  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Replace multiple spaces with single space
  text = text.replace(/[ \t]+/g, " ");

  // Split by double newlines OR single newlines followed by uppercase (new section)
  const chunks = text.split(/\n{2,}/);

  const paragraphs: string[] = [];

  chunks.forEach((chunk) => {
    // Further split by single newlines if chunk is too long
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length === 0) return;

    // Check if this looks like multiple paragraphs joined by single newlines
    if (lines.length > 1) {
      let currentPara = "";
      lines.forEach((line) => {
        // If line starts with uppercase and previous para exists, it might be a new paragraph
        const isNewSection =
          /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇÑ\d]/.test(line) &&
          (line.length < 100 || /^[IVX]+\.\s|^\d+[\.\)]\s|^[A-Z]{2,}/.test(line));

        if (isNewSection && currentPara.length > 50) {
          paragraphs.push(currentPara.trim());
          currentPara = line;
        } else {
          currentPara += (currentPara ? " " : "") + line;
        }
      });
      if (currentPara.trim()) {
        paragraphs.push(currentPara.trim());
      }
    } else {
      paragraphs.push(lines[0]);
    }
  });

  return paragraphs.filter((p) => p.length > 0);
}

// Detect if a paragraph is a heading
function isHeading(text: string): boolean {
  const trimmed = text.trim();

  // Roman numerals sections: I., II., III., IV., V., etc.
  if (/^[IVX]+\.\s/.test(trimmed)) return true;

  // Numbered sections: 1., 2., 1), 2), etc. at start with short text
  if (/^\d+[\.\)]\s/.test(trimmed) && trimmed.length < 100) return true;

  // All caps text (likely a title)
  if (/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,\.]+$/.test(trimmed) && trimmed.length < 80 && trimmed.length > 3) {
    return true;
  }

  // Common heading patterns
  if (/^(CONCEITO|INTRODUÇÃO|CONCLUSÃO|DEFINIÇÃO|ORIGEM|HISTÓRIA|CAPÍTULO|SEÇÃO|PARTE|MÓDULO)/i.test(trimmed)) {
    return true;
  }

  return false;
}

// Detect if paragraph is a list item
function isListItem(text: string): boolean {
  return /^[\•\-\*]\s/.test(text.trim()) || /^\d+[\.\)]\s/.test(text.trim());
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
  const [zoom, setZoom] = useState(100);

  // Reset to page 1 when content changes
  useEffect(() => {
    setCurrentPage(1);
  }, [content]);

  // Parse content into pages
  const pages = useMemo(() => {
    if (!content) return [];

    const paragraphs = preprocessContent(content);
    if (paragraphs.length === 0) return [];

    const result: string[][] = [];
    let currentPageContent: string[] = [];
    let currentLength = 0;
    const maxLength = 2500; // More content per page

    paragraphs.forEach((p) => {
      const pLength = p.length;

      // Start new page if adding this would exceed limit (and we have content)
      if (currentLength + pLength > maxLength && currentPageContent.length > 0) {
        result.push(currentPageContent);
        currentPageContent = [p];
        currentLength = pLength;
      } else {
        currentPageContent.push(p);
        currentLength += pLength;
      }
    });

    if (currentPageContent.length > 0) {
      result.push(currentPageContent);
    }

    return result;
  }, [content]);

  const totalPages = Math.max(1, pages.length);

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const allParagraphs = preprocessContent(content || "");
    const formattedContent = allParagraphs
      .map((p) => {
        if (isHeading(p)) {
          return `<h2>${p}</h2>`;
        }
        if (isListItem(p)) {
          return `<p class="list-item">${p}</p>`;
        }
        return `<p>${p}</p>`;
      })
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=Inter:wght@400;500&display=swap');
            
            @page {
              size: A4;
              margin: 2.5cm 2cm;
            }
            
            body {
              font-family: 'Crimson Pro', Georgia, serif;
              font-size: 12pt;
              line-height: 1.8;
              color: #1a1a1a;
              max-width: 100%;
              margin: 0;
              padding: 0;
            }
            
            .cover {
              height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              background: linear-gradient(180deg, #7c2d12 0%, #991b1b 100%);
              color: white;
              page-break-after: always;
              margin: -2.5cm -2cm;
              padding: 2cm;
            }
            
            .cover-logo {
              width: 80px;
              height: 80px;
              border: 2px solid rgba(255,215,0,0.6);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 24px;
            }
            
            .cover-logo::before {
              content: "✝";
              font-size: 32px;
              color: #fbbf24;
            }
            
            .cover h1 {
              font-size: 28pt;
              font-weight: 600;
              margin: 24px 0;
              line-height: 1.3;
            }
            
            .cover .subtitle {
              font-size: 11pt;
              opacity: 0.9;
              margin-top: 8px;
            }
            
            .cover .category {
              font-size: 10pt;
              text-transform: uppercase;
              letter-spacing: 2px;
              opacity: 0.8;
              margin-bottom: 16px;
            }
            
            .cover .footer {
              position: absolute;
              bottom: 60px;
              font-size: 9pt;
              opacity: 0.7;
            }
            
            .content {
              padding-top: 20px;
            }
            
            h2 {
              font-size: 14pt;
              font-weight: 600;
              margin: 28px 0 14px 0;
              color: #7c2d12;
              border-bottom: 1px solid #e5e5e5;
              padding-bottom: 8px;
            }
            
            p {
              margin-bottom: 14px;
              text-align: justify;
              text-indent: 1.5em;
            }
            
            p:first-of-type {
              text-indent: 0;
            }
            
            p.list-item {
              text-indent: 0;
              padding-left: 1.5em;
            }
            
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="cover">
            <div class="cover-logo"></div>
            <p style="font-size: 11pt; margin: 0;">P.O.D SEMINÁRIO TEOLÓGICO</p>
            <p class="subtitle">Formando Líderes para o Reino de Deus</p>
            ${category ? `<p class="category">${category}</p>` : ""}
            <h1>${title}</h1>
            <p class="footer">${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} • Material Didático Exclusivo</p>
          </div>
          <div class="content">
            ${formattedContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const zoomIn = () => setZoom((z) => Math.min(z + 10, 150));
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 70));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 bg-muted/50">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-card border-b shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-foreground text-sm sm:text-base truncate">{title}</h2>
              {category && <p className="text-[10px] sm:text-xs text-muted-foreground">{category}</p>}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={loading || !content}
              className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Baixar PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="w-8 h-8 sm:w-9 sm:h-9">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 overflow-hidden bg-muted/80 flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Carregando documento...</p>
              </div>
            </div>
          ) : content && pages.length > 0 ? (
            <>
              {/* Document Area */}
              <ScrollArea className="flex-1 p-3 sm:p-6">
                <div className="max-w-3xl mx-auto">
                  {/* Page Simulation */}
                  <div
                    className="bg-white dark:bg-card rounded-lg shadow-xl border border-border/50 p-5 sm:p-8 md:p-10"
                    style={{
                      fontSize: `${zoom}%`,
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 25px 50px -12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {currentPage === 1 && (
                      <div className="text-center mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-muted">
                        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mb-2">
                          {category || "Material Didático"}
                        </p>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-semibold text-foreground mb-2 sm:mb-3">
                          {title}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">P.O.D Seminário Teológico</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {pages[currentPage - 1]?.map((paragraph, index) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return null;

                        // Heading
                        if (isHeading(trimmed)) {
                          return (
                            <h2
                              key={index}
                              className="text-base sm:text-lg font-serif font-semibold text-primary mt-4 sm:mt-6 mb-2 sm:mb-3 border-b border-muted pb-2"
                            >
                              {trimmed}
                            </h2>
                          );
                        }

                        // List item
                        if (isListItem(trimmed)) {
                          return (
                            <p key={index} className="text-foreground leading-relaxed text-sm sm:text-base pl-4">
                              {trimmed}
                            </p>
                          );
                        }

                        // Regular paragraph
                        return (
                          <p
                            key={index}
                            className="text-foreground leading-relaxed sm:leading-loose text-sm sm:text-base text-justify first:indent-0"
                            style={{ textIndent: index > 0 ? "1.5rem" : 0 }}
                          >
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Bottom Toolbar */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-card border-t shrink-0">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={zoomOut} disabled={zoom <= 70} className="w-8 h-8">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground w-10 sm:w-12 text-center">{zoom}%</span>
                  <Button variant="ghost" size="icon" onClick={zoomIn} disabled={zoom >= 150} className="w-8 h-8">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1 sm:gap-3">
                  <Button variant="ghost" size="icon" onClick={prevPage} disabled={currentPage <= 1} className="w-8 h-8">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {currentPage} / {totalPages}
                  </span>
                  <Button variant="ghost" size="icon" onClick={nextPage} disabled={currentPage >= totalPages} className="w-8 h-8">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="w-16 sm:w-24" /> {/* Spacer for balance */}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhum conteúdo disponível</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
