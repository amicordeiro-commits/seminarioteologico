import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, BookOpen, Printer } from "lucide-react";

interface SermonReaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string | null;
  category: string | null;
}

export function SermonReader({ 
  open, 
  onOpenChange, 
  title, 
  content, 
  category 
}: SermonReaderProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: Georgia, serif; 
              line-height: 1.8; 
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { 
              font-size: 24px; 
              margin-bottom: 10px;
              color: #1a1a1a;
            }
            .category {
              font-size: 14px;
              color: #666;
              margin-bottom: 30px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 20px;
            }
            .content { 
              white-space: pre-wrap; 
              font-size: 16px;
              color: #333;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="category">${category || 'Sermão'}</div>
          <div class="content">${content || ''}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="font-serif text-xl text-left">
                  {title}
                </DialogTitle>
                {category && (
                  <p className="text-sm text-muted-foreground mt-1">{category}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {content ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-foreground">
                {content}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Conteúdo não disponível</p>
              <p className="text-sm mt-2">
                Este material ainda não possui conteúdo completo cadastrado.
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}