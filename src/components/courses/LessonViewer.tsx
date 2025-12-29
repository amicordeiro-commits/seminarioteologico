import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, X } from "lucide-react";

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
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Georgia, serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.8;
              color: #333;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 8px;
              color: #1a1a1a;
            }
            .category {
              font-size: 14px;
              color: #666;
              margin-bottom: 24px;
            }
            p {
              margin-bottom: 16px;
              text-align: justify;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${category ? `<p class="category">${category}</p>` : ''}
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
          ${formatForPrint(content || '')}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-card flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <DialogTitle className="text-xl font-serif truncate">{title}</DialogTitle>
              {category && (
                <p className="text-sm text-muted-foreground mt-1">{category}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={loading || !content}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
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
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : content ? (
            <div className="prose prose-sm max-w-none">
              {content.split('\n\n').map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                // Detecta títulos (linhas em maiúsculas com menos de 80 caracteres)
                if (trimmed.match(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇÑ\s\d\-:,]+$/) && trimmed.length < 80) {
                  return (
                    <h2 key={index} className="text-lg font-serif font-semibold text-foreground mt-6 mb-3">
                      {trimmed}
                    </h2>
                  );
                }

                // Parágrafo normal
                return (
                  <p key={index} className="text-foreground leading-relaxed mb-4 text-justify">
                    {trimmed}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Nenhum conteúdo disponível
            </div>
          )}
        </ScrollArea>
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
        return `<h2 style="font-size: 18px; margin: 24px 0 12px 0;">${p}</h2>`;
      }
      return `<p>${p}</p>`;
    })
    .join('\n');
}
