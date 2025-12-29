import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Download, X, BookOpen, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useMemo } from "react";

interface LessonViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string | null;
  loading?: boolean;
  category?: string;
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

  // Parse content into pages (split by double newlines, group ~800 chars per page)
  const pages = useMemo(() => {
    if (!content) return [];
    
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const result: string[][] = [];
    let currentPageContent: string[] = [];
    let currentLength = 0;
    const maxLength = 1200;

    paragraphs.forEach(p => {
      if (currentLength + p.length > maxLength && currentPageContent.length > 0) {
        result.push(currentPageContent);
        currentPageContent = [p];
        currentLength = p.length;
      } else {
        currentPageContent.push(p);
        currentLength += p.length;
      }
    });

    if (currentPageContent.length > 0) {
      result.push(currentPageContent);
    }

    return result.length > 0 ? result : [paragraphs];
  }, [content]);

  const totalPages = pages.length;

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

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
            ${category ? `<p class="category">${category}</p>` : ''}
            <h1>${title}</h1>
            <p class="footer">${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} • Material Didático Exclusivo</p>
          </div>
          <div class="content">
            ${formatForPrint(content || '')}
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

  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const zoomIn = () => setZoom(z => Math.min(z + 10, 150));
  const zoomOut = () => setZoom(z => Math.max(z - 10, 70));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[95vh] flex flex-col p-0 gap-0 bg-muted/50">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-card border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-foreground truncate max-w-md">{title}</h2>
              {category && (
                <p className="text-xs text-muted-foreground">{category}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={loading || !content}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 overflow-hidden bg-muted/80 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">Carregando documento...</p>
              </div>
            </div>
          ) : content ? (
            <>
              {/* Document Area */}
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-3xl mx-auto">
                  {/* Page Simulation */}
                  <div 
                    className="bg-white rounded-lg shadow-xl border border-border/50 p-8 md:p-12 min-h-[70vh]"
                    style={{ 
                      fontSize: `${zoom}%`,
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 25px 50px -12px rgba(0,0,0,0.15)'
                    }}
                  >
                    {currentPage === 1 && (
                      <div className="text-center mb-8 pb-8 border-b border-muted">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                          {category || 'Material Didático'}
                        </p>
                        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-3">
                          {title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          P.O.D Seminário Teológico
                        </p>
                      </div>
                    )}
                    
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {pages[currentPage - 1]?.map((paragraph, index) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return null;

                        // Detecta títulos
                        if (trimmed.match(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇÑ\s\d\-:,]+$/) && trimmed.length < 80) {
                          return (
                            <h2 key={index} className="text-lg font-serif font-semibold text-primary mt-6 mb-3 border-b border-muted pb-2">
                              {trimmed}
                            </h2>
                          );
                        }

                        return (
                          <p key={index} className="text-foreground leading-relaxed mb-4 text-justify indent-6 first:indent-0">
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Bottom Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 bg-card border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={zoomOut} disabled={zoom <= 70}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
                  <Button variant="ghost" size="icon" onClick={zoomIn} disabled={zoom >= 150}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={prevPage} 
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={nextPage} 
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="w-24" /> {/* Spacer for balance */}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum conteúdo disponível</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatForPrint(text: string): string {
  if (!text) return '';
  
  return text
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      if (p.match(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇÑ\s\d\-:,]+$/) && p.length < 80) {
        return `<h2>${p}</h2>`;
      }
      return `<p>${p}</p>`;
    })
    .join('\n');
}
