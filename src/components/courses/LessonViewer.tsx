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
function splitIntoPages(text: string, charsPerPage = 4000): string[] {
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
        if (/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,.]+$/.test(t) && t.length < 80) return `<h2>${t}</h2>`;
        if (/^[IVX]+\.\s/.test(t)) return `<h2>${t}</h2>`;
        return `<p>${t}</p>`;
      }).join("")}
    </body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <BookOpen className="w-5 h-5 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-semibold text-sm sm:text-base truncate">{title}</h2>
              {category && <p className="text-xs opacity-80">{category}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={loading || !content}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Download className="w-4 h-4 mr-1" />
              PDF
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-muted/20">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : content ? (
            <ScrollArea className="h-full">
              <div className="max-w-2xl mx-auto p-4 sm:p-8">
                {currentPage === 1 && (
                  <div className="text-center mb-6 pb-4 border-b">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{category}</p>
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-primary">{title}</h1>
                  </div>
                )}
                
                <div className="space-y-4">
                  {pages[currentPage - 1]?.split(/\n\n+/).map((p, i) => {
                    const t = p.trim();
                    if (!t) return null;
                    
                    // Heading detection (simple)
                    const isHeading = (/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,.]+$/.test(t) && t.length < 80) || /^[IVX]+\.\s/.test(t);
                    
                    if (isHeading) {
                      return (
                        <h2 key={i} className="text-base sm:text-lg font-semibold text-primary mt-4 border-l-3 border-accent pl-3">
                          {t}
                        </h2>
                      );
                    }
                    
                    return (
                      <p key={i} className="text-sm sm:text-base text-foreground leading-relaxed text-justify">
                        {t}
                      </p>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <BookOpen className="w-10 h-10 opacity-40" />
            </div>
          )}
        </div>

        {/* Footer */}
        {content && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 px-4 py-2 bg-card border-t shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{currentPage} / {totalPages}</span>
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
