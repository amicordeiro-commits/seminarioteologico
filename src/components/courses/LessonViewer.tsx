import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Download,
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Bookmark,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface LessonViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string | null;
  loading?: boolean;
  category?: string;
}

interface FormattedBlock {
  type: "heading1" | "heading2" | "heading3" | "paragraph" | "list" | "quote" | "separator";
  content: string;
}

// Parse and format content into structured blocks
function parseContent(raw: string): FormattedBlock[] {
  if (!raw) return [];

  // Normalize line breaks
  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Split by double+ newlines
  const chunks = text.split(/\n{2,}/);
  const blocks: FormattedBlock[] = [];

  chunks.forEach((chunk) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;

    // Clean up internal line breaks
    const cleaned = trimmed
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ");

    if (!cleaned) return;

    // Detect block type
    const blockType = detectBlockType(cleaned);
    blocks.push({ type: blockType, content: cleaned });
  });

  return blocks;
}

function detectBlockType(text: string): FormattedBlock["type"] {
  const trimmed = text.trim();

  // Main title patterns (CURSO SUPERIOR, DISCIPLINA, etc.)
  if (/^(CURSO|DISCIPLINA|MÓDULO|UNIDADE)\s/i.test(trimmed) && trimmed.length < 100) {
    return "heading1";
  }

  // Roman numeral sections: I., II., III., IV., V., etc.
  if (/^[IVX]+\.\s/.test(trimmed) && trimmed.length < 120) {
    return "heading2";
  }

  // Numbered major sections: 1., 2., etc. with short text
  if (/^\d+\.\s+[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]/.test(trimmed) && trimmed.length < 100) {
    return "heading3";
  }

  // All caps text (section titles)
  if (/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,\.()]+$/.test(trimmed) && trimmed.length < 80 && trimmed.length > 5) {
    // Check if it's mostly uppercase
    const upperCount = (trimmed.match(/[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]/g) || []).length;
    if (upperCount > trimmed.length * 0.6) {
      return "heading2";
    }
  }

  // Common heading keywords
  if (
    /^(CONCEITO|INTRODUÇÃO|CONCLUSÃO|DEFINIÇÃO|ORIGEM|HISTÓRIA|OBJETIVOS|CARACTERÍSTICAS|ASPECTOS|TEORIA|ABORDAGEM)/i.test(
      trimmed
    ) &&
    trimmed.length < 100
  ) {
    return "heading2";
  }

  // List items
  if (/^[\•\-\*]\s/.test(trimmed) || /^[a-z]\)\s/i.test(trimmed)) {
    return "list";
  }

  // Quote patterns
  if (/^[""]/.test(trimmed) && /[""]$/.test(trimmed)) {
    return "quote";
  }

  // Separator patterns
  if (/^[-_=]{3,}$/.test(trimmed) || trimmed === "***") {
    return "separator";
  }

  return "paragraph";
}

// Split blocks into pages
function paginateBlocks(blocks: FormattedBlock[], charsPerPage: number = 3000): FormattedBlock[][] {
  const pages: FormattedBlock[][] = [];
  let currentPage: FormattedBlock[] = [];
  let currentLength = 0;

  blocks.forEach((block) => {
    const blockLength = block.content.length;

    // Don't split headings from their following content
    const isHeading = block.type.startsWith("heading");

    if (currentLength + blockLength > charsPerPage && currentPage.length > 0 && !isHeading) {
      pages.push(currentPage);
      currentPage = [block];
      currentLength = blockLength;
    } else {
      currentPage.push(block);
      currentLength += blockLength;
    }
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : [[]];
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

  // Reset page when content changes
  useEffect(() => {
    setCurrentPage(1);
  }, [content]);

  // Parse and paginate content
  const { pages, totalBlocks } = useMemo(() => {
    const blocks = parseContent(content || "");
    const paginated = paginateBlocks(blocks);
    return { pages: paginated, totalBlocks: blocks.length };
  }, [content]);

  const totalPages = pages.length;

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const blocks = parseContent(content || "");
    const formattedHtml = blocks
      .map((block) => {
        switch (block.type) {
          case "heading1":
            return `<h1 class="h1">${block.content}</h1>`;
          case "heading2":
            return `<h2 class="h2">${block.content}</h2>`;
          case "heading3":
            return `<h3 class="h3">${block.content}</h3>`;
          case "list":
            return `<p class="list">${block.content}</p>`;
          case "quote":
            return `<blockquote>${block.content}</blockquote>`;
          case "separator":
            return `<hr />`;
          default:
            return `<p>${block.content}</p>`;
        }
      })
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
            
            @page { size: A4; margin: 2.5cm 2.5cm; }
            
            body {
              font-family: 'Crimson Pro', Georgia, serif;
              font-size: 12pt;
              line-height: 1.9;
              color: #1a1a1a;
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
              background: linear-gradient(160deg, #4a1518 0%, #7c2d12 50%, #991b1b 100%);
              color: white;
              page-break-after: always;
              margin: -2.5cm;
              padding: 3cm;
            }
            
            .cover-ornament {
              width: 100px;
              height: 2px;
              background: linear-gradient(90deg, transparent, #d4af37, transparent);
              margin: 20px auto;
            }
            
            .cover h1 {
              font-size: 32pt;
              font-weight: 600;
              margin: 30px 0;
              line-height: 1.2;
              letter-spacing: 1px;
            }
            
            .cover .institution {
              font-size: 12pt;
              letter-spacing: 3px;
              text-transform: uppercase;
              opacity: 0.9;
            }
            
            .cover .category {
              font-size: 10pt;
              letter-spacing: 2px;
              text-transform: uppercase;
              opacity: 0.7;
              margin-top: 40px;
            }
            
            .content { padding: 20px 0; }
            
            .h1 {
              font-size: 18pt;
              font-weight: 600;
              text-align: center;
              margin: 40px 0 30px;
              color: #4a1518;
              letter-spacing: 1px;
            }
            
            .h2 {
              font-size: 14pt;
              font-weight: 600;
              margin: 35px 0 18px;
              color: #7c2d12;
              border-left: 4px solid #d4af37;
              padding-left: 16px;
            }
            
            .h3 {
              font-size: 12pt;
              font-weight: 600;
              margin: 25px 0 12px;
              color: #1a1a1a;
            }
            
            p {
              margin-bottom: 16px;
              text-align: justify;
              text-indent: 2em;
              hyphens: auto;
            }
            
            p:first-of-type { text-indent: 0; }
            
            .list {
              text-indent: 0;
              padding-left: 2em;
              margin-bottom: 10px;
            }
            
            blockquote {
              margin: 20px 40px;
              padding: 15px 20px;
              border-left: 3px solid #d4af37;
              background: #faf8f5;
              font-style: italic;
              color: #4a4a4a;
            }
            
            hr {
              border: none;
              height: 1px;
              background: linear-gradient(90deg, transparent, #d4af37, transparent);
              margin: 30px 0;
            }
            
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="cover">
            <p class="institution">P.O.D Seminário Teológico</p>
            <div class="cover-ornament"></div>
            <h1>${title}</h1>
            <div class="cover-ornament"></div>
            ${category ? `<p class="category">${category}</p>` : ""}
          </div>
          <div class="content">${formattedHtml}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 600);
  };

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const zoomIn = () => setZoom((z) => Math.min(z + 10, 150));
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 70));

  const renderBlock = (block: FormattedBlock, index: number) => {
    switch (block.type) {
      case "heading1":
        return (
          <h1
            key={index}
            className="text-xl sm:text-2xl font-serif font-bold text-center text-primary my-6 sm:my-8 tracking-wide"
          >
            {block.content}
          </h1>
        );

      case "heading2":
        return (
          <div key={index} className="my-5 sm:my-7">
            <h2 className="text-base sm:text-lg font-serif font-semibold text-primary border-l-4 border-accent pl-4 py-1">
              {block.content}
            </h2>
          </div>
        );

      case "heading3":
        return (
          <h3
            key={index}
            className="text-sm sm:text-base font-serif font-semibold text-foreground mt-5 mb-3"
          >
            {block.content}
          </h3>
        );

      case "list":
        return (
          <p key={index} className="text-sm sm:text-base text-foreground pl-6 mb-2 leading-relaxed">
            {block.content}
          </p>
        );

      case "quote":
        return (
          <blockquote
            key={index}
            className="my-4 sm:my-6 mx-4 sm:mx-8 px-4 py-3 border-l-3 border-accent bg-accent/5 italic text-muted-foreground text-sm sm:text-base rounded-r"
          >
            {block.content}
          </blockquote>
        );

      case "separator":
        return (
          <div key={index} className="my-6 sm:my-8 flex items-center justify-center">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            <Bookmark className="w-4 h-4 mx-3 text-accent" />
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
          </div>
        );

      default:
        return (
          <p
            key={index}
            className="text-sm sm:text-base text-foreground leading-relaxed sm:leading-loose mb-4 text-justify"
            style={{ textIndent: index > 0 ? "1.75rem" : 0 }}
          >
            {block.content}
          </p>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-primary text-primary-foreground shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif font-semibold text-sm sm:text-lg truncate">{title}</h2>
              {category && (
                <p className="text-[10px] sm:text-xs opacity-80 uppercase tracking-wider">{category}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={loading || !content}
              className="gap-1.5 text-xs sm:text-sm bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-primary-foreground hover:bg-primary-foreground/10 w-9 h-9"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-muted/30 flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">Carregando material...</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Aguarde um momento</p>
              </div>
            </div>
          ) : content && pages.length > 0 && pages[0].length > 0 ? (
            <>
              <ScrollArea className="flex-1 px-4 sm:px-8 py-4 sm:py-6">
                <div className="max-w-3xl mx-auto">
                  {/* Document Paper */}
                  <article
                    className="bg-card rounded-lg shadow-2xl border border-border/50 overflow-hidden"
                    style={{ fontSize: `${zoom}%` }}
                  >
                    {/* Page Header Decoration */}
                    <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

                    <div className="p-6 sm:p-10 md:p-12">
                      {/* Title on first page */}
                      {currentPage === 1 && (
                        <header className="text-center mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-border">
                          <Badge variant="secondary" className="mb-3 text-[10px] sm:text-xs uppercase tracking-widest">
                            {category || "Material Didático"}
                          </Badge>
                          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary mb-3 leading-tight">
                            {title}
                          </h1>
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <div className="w-8 h-px bg-accent" />
                            <span className="text-xs sm:text-sm">P.O.D Seminário Teológico</span>
                            <div className="w-8 h-px bg-accent" />
                          </div>
                        </header>
                      )}

                      {/* Page Content */}
                      <div className="prose-container">
                        {pages[currentPage - 1]?.map((block, index) => renderBlock(block, index))}
                      </div>
                    </div>

                    {/* Page Footer */}
                    <div className="px-6 sm:px-10 py-3 sm:py-4 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-serif italic">{title}</span>
                      <span>Página {currentPage} de {totalPages}</span>
                    </div>
                  </article>
                </div>
              </ScrollArea>

              {/* Bottom Controls */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-card border-t border-border shrink-0">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={zoomOut}
                    disabled={zoom <= 70}
                    className="w-8 h-8 hover:bg-background"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground w-10 text-center">{zoom}%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={zoomIn}
                    disabled={zoom >= 150}
                    className="w-8 h-8 hover:bg-background"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={currentPage <= 1}
                    className="gap-1 px-2 sm:px-3"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Anterior</span>
                  </Button>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg">
                    <span className="text-sm font-semibold text-primary">{currentPage}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-sm text-muted-foreground">{totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={currentPage >= totalPages}
                    className="gap-1 px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Próxima</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Spacer for balance */}
                <div className="w-20 sm:w-28" />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 opacity-40" />
                </div>
                <p className="font-medium">Nenhum conteúdo disponível</p>
                <p className="text-sm opacity-70 mt-1">O material ainda não foi carregado</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
