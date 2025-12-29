import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Loader2, BookOpen, Printer, X, ChevronUp, ChevronDown, 
  ZoomIn, ZoomOut, List, Type, Moon, Sun, Maximize2, Minimize2,
  FileText, Clock, BookMarked, GraduationCap
} from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";

interface LessonViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string | null;
  loading?: boolean;
  category?: string;
}

interface TocItem {
  id: string;
  title: string;
  level: number;
}

// Função para formatar o conteúdo
function formatContent(text: string): { html: string; toc: TocItem[] } {
  if (!text) return { html: "", toc: [] };

  const lines = text.split('\n');
  const htmlParts: string[] = [];
  const toc: TocItem[] = [];
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
        const formatted = text.replace(
          /\(([1-3]?\s?[A-ZÁ][a-záéíóúâêôã]+\.?\s+\d+[:\.\,]\d+(?:\-\d+)?)\)/g,
          '<span class="bible-ref">($1)</span>'
        );
        htmlParts.push(`<p class="content-paragraph">${formatted}</p>`);
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
    
    if (line.match(/^[\d]+$/) && line.length <= 4) continue;
    if (line.match(/^página\s*\d+/i)) continue;
    
    const lowerLine = line.toLowerCase();

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

    if (
      lowerLine.includes('curso superior') ||
      lowerLine.includes('seminário') ||
      lowerLine.includes('disciplina:') ||
      lowerLine.includes('professor:') ||
      lowerLine.includes('carga horária')
    ) continue;

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

    if (line.match(/https?:\/\/|www\./)) continue;
    if (lowerLine.includes('isbn')) continue;
    if (lowerLine.startsWith('fonte:')) continue;

    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    // Títulos principais
    if (line.match(/^(CONCEITO|INTRODUÇÃO|CONCLUSÃO|CONSIDERAÇÕES)/i)) {
      flushParagraph();
      closeList();
      sectionCount++;
      const id = `section-${sectionCount}`;
      const titleText = line.charAt(0) + line.slice(1).toLowerCase();
      toc.push({ id, title: titleText, level: 1 });
      htmlParts.push(`<h2 id="${id}" class="section-title level-1">${titleText}</h2>`);
      continue;
    }

    // Títulos em maiúsculas
    if (line.match(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇÑ\s]{15,}$/) && !line.includes('.') && line.length < 80) {
      flushParagraph();
      closeList();
      sectionCount++;
      const id = `section-${sectionCount}`;
      const title = line.charAt(0) + line.slice(1).toLowerCase();
      toc.push({ id, title, level: 2 });
      htmlParts.push(`<h3 id="${id}" class="section-title level-2">${title}</h3>`);
      continue;
    }

    // Números romanos
    if (line.match(/^[IVXLC]+[\.\-\)]\s+/i)) {
      flushParagraph();
      closeList();
      sectionCount++;
      const id = `section-${sectionCount}`;
      const romanNum = line.match(/^[IVXLC]+/i)?.[0] || '';
      const content = line.replace(/^[IVXLC]+[\.\-\)]\s+/i, '');
      toc.push({ id, title: content, level: 2 });
      htmlParts.push(`<h3 id="${id}" class="section-title level-2 with-number">
        <span class="section-number">${romanNum}</span>
        <span>${content}</span>
      </h3>`);
      continue;
    }

    // Títulos numerados
    if (line.match(/^\d+[\.\-\)]\s+/) && line.length < 80 && !line.match(/^\d+[\.\-\)]\s+[a-z]/)) {
      flushParagraph();
      closeList();
      const content = line.replace(/^\d+[\.\-\)]\s+/, '');
      const num = line.match(/^\d+/)?.[0];
      htmlParts.push(`<h4 class="section-title level-3 with-number">
        <span class="section-number small">${num}</span>
        <span>${content}</span>
      </h4>`);
      continue;
    }

    // Listas
    if (line.match(/^[a-z]\)\s+/i) || line.match(/^[\-•►▸◆]\s+/)) {
      flushParagraph();
      if (!inList || listType !== 'ul') {
        closeList();
        htmlParts.push('<ul class="content-list">');
        inList = true;
        listType = 'ul';
      }
      const content = line.replace(/^[a-z]\)\s+|^[\-•►▸◆]\s+/i, '');
      htmlParts.push(`<li><span class="list-marker"></span><span>${content}</span></li>`);
      continue;
    }

    // Citações bíblicas
    const bibleRefPattern = /([1-3]?\s?[A-ZÁ][a-záéíóúâêôã]+\.?\s+\d+[:\.\,]\d+(?:\-\d+)?)/;
    if (line.match(bibleRefPattern) && line.length < 300 && (line.startsWith('"') || line.includes(':'))) {
      flushParagraph();
      closeList();
      const formatted = line.replace(bibleRefPattern, '<strong class="verse-ref">$1</strong>');
      htmlParts.push(`<blockquote class="bible-quote">${formatted}</blockquote>`);
      continue;
    }

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
  const [fontSize, setFontSize] = useState(100);
  const [showToc, setShowToc] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { html, toc } = useMemo(() => formatContent(content || ''), [content]);

  // Estima tempo de leitura
  const readingTime = useMemo(() => {
    if (!content) return 0;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200);
  }, [content]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setShowScrollTop(target.scrollTop > 300);

    // Detectar seção ativa
    if (toc.length > 0) {
      const sections = toc.map(item => document.getElementById(item.id));
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(toc[i].id);
            break;
          }
        }
      }
    }
  };

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Source+Sans+Pro:wght@400;600&display=swap');
            
            :root {
              --primary: #5c2d3d;
              --text: #2d2d2d;
              --muted: #6b6b6b;
              --border: #e5e5e5;
              --bg-accent: #faf8f6;
            }
            
            * { box-sizing: border-box; }
            
            body { 
              font-family: 'Crimson Pro', Georgia, serif;
              max-width: 750px;
              margin: 0 auto;
              padding: 60px 40px;
              line-height: 1.8;
              color: var(--text);
              font-size: 16px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 50px;
              padding-bottom: 30px;
              border-bottom: 2px solid var(--primary);
            }
            
            .category {
              display: inline-block;
              background: var(--bg-accent);
              color: var(--primary);
              padding: 6px 16px;
              border-radius: 20px;
              font-family: 'Source Sans Pro', sans-serif;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 20px;
            }
            
            h1 {
              font-size: 32px;
              font-weight: 700;
              margin: 0;
              line-height: 1.3;
            }
            
            .meta {
              font-family: 'Source Sans Pro', sans-serif;
              color: var(--muted);
              font-size: 14px;
              margin-top: 15px;
            }
            
            h2 { 
              font-size: 24px;
              margin-top: 45px;
              margin-bottom: 20px;
              color: var(--primary);
              font-weight: 600;
              border-bottom: 1px solid var(--border);
              padding-bottom: 10px;
            }
            
            h3 { 
              font-size: 20px;
              margin-top: 35px;
              margin-bottom: 15px;
              font-weight: 600;
            }
            
            h4 { 
              font-size: 17px;
              margin-top: 25px;
              margin-bottom: 12px;
              font-weight: 600;
            }
            
            p { 
              text-align: justify;
              margin-bottom: 18px;
            }
            
            blockquote { 
              border-left: 4px solid var(--primary);
              padding: 15px 20px;
              margin: 25px 0;
              background: var(--bg-accent);
              font-style: italic;
              color: var(--muted);
            }
            
            ul { 
              list-style: none;
              padding-left: 0;
            }
            
            li { 
              padding-left: 25px;
              position: relative;
              margin-bottom: 10px;
            }
            
            li::before {
              content: '';
              position: absolute;
              left: 8px;
              top: 10px;
              width: 6px;
              height: 6px;
              background: var(--primary);
              border-radius: 50%;
            }
            
            .verse-ref { color: var(--primary); }
            
            @page {
              margin: 2cm;
            }
            
            @media print {
              body { padding: 0; }
              .header { page-break-after: avoid; }
              h2, h3, h4 { page-break-after: avoid; }
              blockquote { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="category">${category || 'Material de Estudo'}</span>
            <h1>${title}</h1>
            <div class="meta">Seminário Teológico Online</div>
          </div>
          ${html}
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`
          ${isFullscreen ? 'max-w-full h-full m-0 rounded-none' : 'max-w-6xl h-[90vh]'} 
          flex flex-col p-0 gap-0 overflow-hidden
          ${darkMode ? 'dark bg-zinc-900' : 'bg-background'}
        `}
      >
        {/* Toolbar Profissional */}
        <div className={`
          px-4 py-3 border-b flex items-center justify-between
          ${darkMode ? 'border-zinc-700 bg-zinc-800' : 'border-border bg-muted/30'}
        `}>
          <div className="flex items-center gap-4">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}
            `}>
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h2 className={`text-sm font-semibold truncate max-w-[300px] ${darkMode ? 'text-zinc-100' : 'text-foreground'}`}>
                {title || "Material"}
              </h2>
              <div className={`flex items-center gap-3 text-xs ${darkMode ? 'text-zinc-400' : 'text-muted-foreground'}`}>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {category || "Material"}
                </span>
                {readingTime > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{readingTime} min leitura
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              {/* Índice Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={showToc ? "secondary" : "ghost"} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setShowToc(!showToc)}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Índice</TooltipContent>
              </Tooltip>

              {/* Zoom */}
              <div className={`
                hidden sm:flex items-center gap-1 px-2 mx-1 rounded-lg
                ${darkMode ? 'bg-zinc-700' : 'bg-background'}
              `}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => setFontSize(Math.max(70, fontSize - 10))}
                  disabled={fontSize <= 70}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <span className={`text-xs min-w-[40px] text-center ${darkMode ? 'text-zinc-300' : 'text-muted-foreground'}`}>
                  {fontSize}%
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                  disabled={fontSize >= 150}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Modo Escuro */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{darkMode ? 'Modo Claro' : 'Modo Escuro'}</TooltipContent>
              </Tooltip>

              {/* Fullscreen */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFullscreen ? 'Sair Tela Cheia' : 'Tela Cheia'}</TooltipContent>
              </Tooltip>

              {/* Imprimir */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={handlePrint}
                    disabled={loading || !content}
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Imprimir</TooltipContent>
              </Tooltip>

              {/* Fechar */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 ml-1"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </TooltipProvider>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Table of Contents */}
          {showToc && toc.length > 0 && !loading && (
            <aside className={`
              hidden md:flex flex-col w-72 border-r overflow-hidden
              ${darkMode ? 'border-zinc-700 bg-zinc-800/50' : 'border-border bg-muted/20'}
            `}>
              <div className={`
                px-4 py-3 border-b flex items-center gap-2
                ${darkMode ? 'border-zinc-700' : 'border-border'}
              `}>
                <BookMarked className="w-4 h-4 text-primary" />
                <span className={`text-sm font-medium ${darkMode ? 'text-zinc-200' : 'text-foreground'}`}>
                  Índice do Documento
                </span>
              </div>
              <ScrollArea className="flex-1">
                <nav className="p-3 space-y-0.5">
                  {toc.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToSection(item.id)}
                      className={`
                        w-full text-left text-sm py-2 px-3 rounded-lg transition-all duration-200
                        ${item.level === 1 ? 'font-medium' : 'pl-6'}
                        ${activeSection === item.id 
                          ? 'bg-primary/15 text-primary border-l-2 border-primary' 
                          : darkMode 
                            ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }
                      `}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </aside>
          )}

          {/* Main Document View */}
          <div className="flex-1 relative overflow-hidden">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4
                      ${darkMode ? 'bg-zinc-800' : 'bg-muted'}
                    `}>
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  </div>
                  <p className={`font-medium ${darkMode ? 'text-zinc-300' : 'text-foreground'}`}>
                    Carregando documento...
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-zinc-500' : 'text-muted-foreground'}`}>
                    Preparando conteúdo para leitura
                  </p>
                </div>
              </div>
            ) : content ? (
              <div 
                ref={contentRef}
                className="h-full overflow-auto scroll-smooth"
                onScroll={handleScroll as any}
              >
                {/* Document Paper */}
                <div className={`
                  min-h-full
                  ${darkMode ? 'bg-zinc-900' : 'bg-gradient-to-b from-muted/30 to-muted/10'}
                `}>
                  <article 
                    className={`
                      max-w-[800px] mx-auto my-6 md:my-10 shadow-xl rounded-lg overflow-hidden
                      ${darkMode ? 'bg-zinc-800 shadow-black/50' : 'bg-background shadow-black/5'}
                    `}
                    style={{ fontSize: `${fontSize}%` }}
                  >
                    {/* Document Header */}
                    <div className={`
                      px-8 md:px-12 py-8 md:py-12 text-center border-b
                      ${darkMode 
                        ? 'border-zinc-700 bg-gradient-to-b from-zinc-700/50 to-transparent' 
                        : 'border-border bg-gradient-to-b from-muted/50 to-transparent'
                      }
                    `}>
                      <Badge 
                        variant="outline" 
                        className={`
                          mb-4 uppercase text-xs tracking-wider font-medium
                          ${darkMode ? 'border-primary/50 text-primary' : ''}
                        `}
                      >
                        {category || "Material de Estudo"}
                      </Badge>
                      
                      <h1 className={`
                        text-2xl md:text-3xl font-serif font-bold leading-tight mb-4
                        ${darkMode ? 'text-zinc-100' : 'text-foreground'}
                      `}>
                        {title}
                      </h1>

                      <div className={`
                        flex items-center justify-center gap-4 text-sm
                        ${darkMode ? 'text-zinc-400' : 'text-muted-foreground'}
                      `}>
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4" />
                          Seminário Teológico
                        </span>
                        {readingTime > 0 && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {readingTime} min de leitura
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Document Content */}
                    <div 
                      className={`
                        px-6 md:px-12 py-8 md:py-10 
                        document-content
                        ${darkMode ? 'dark-mode' : ''}
                      `}
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </article>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4
                    ${darkMode ? 'bg-zinc-800' : 'bg-muted'}
                  `}>
                    <BookOpen className="w-10 h-10 text-muted-foreground opacity-50" />
                  </div>
                  <p className={`font-medium ${darkMode ? 'text-zinc-300' : 'text-foreground'}`}>
                    Nenhum conteúdo disponível
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-zinc-500' : 'text-muted-foreground'}`}>
                    Este material ainda não possui conteúdo
                  </p>
                </div>
              </div>
            )}

            {/* Floating Actions */}
            {showScrollTop && (
              <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className={`
                    rounded-full shadow-lg h-10 w-10
                    ${darkMode ? 'bg-zinc-700 hover:bg-zinc-600' : ''}
                  `}
                  onClick={scrollToTop}
                >
                  <ChevronUp className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Document Styles */}
        <style>{`
          .document-content {
            font-family: 'Georgia', 'Crimson Pro', serif;
            line-height: 1.85;
          }

          .document-content.dark-mode {
            color: #e4e4e7;
          }

          .document-content .section-title {
            font-family: inherit;
            font-weight: 600;
            scroll-margin-top: 80px;
          }

          .document-content .section-title.level-1 {
            font-size: 1.5em;
            color: hsl(var(--primary));
            margin-top: 2.5em;
            margin-bottom: 1em;
            padding-bottom: 0.5em;
            border-bottom: 2px solid hsl(var(--primary) / 0.2);
          }

          .document-content .section-title.level-2 {
            font-size: 1.25em;
            margin-top: 2em;
            margin-bottom: 0.75em;
          }

          .document-content .section-title.level-3 {
            font-size: 1.1em;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }

          .document-content .section-title.with-number {
            display: flex;
            align-items: center;
            gap: 0.75em;
          }

          .document-content .section-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 2em;
            height: 2em;
            background: hsl(var(--primary) / 0.1);
            color: hsl(var(--primary));
            border-radius: 8px;
            font-size: 0.85em;
            font-weight: 700;
            flex-shrink: 0;
          }

          .document-content .section-number.small {
            width: 1.75em;
            height: 1.75em;
            font-size: 0.8em;
            border-radius: 6px;
          }

          .document-content .content-paragraph {
            margin-bottom: 1.25em;
            text-align: justify;
            hyphens: auto;
          }

          .document-content .bible-ref {
            color: hsl(var(--primary) / 0.8);
            font-style: italic;
          }

          .document-content .content-list {
            list-style: none;
            padding: 0;
            margin: 1.25em 0;
          }

          .document-content .content-list li {
            display: flex;
            align-items: flex-start;
            gap: 0.75em;
            padding: 0.5em 0;
            padding-left: 0.5em;
          }

          .document-content .list-marker {
            width: 6px;
            height: 6px;
            background: hsl(var(--primary));
            border-radius: 50%;
            margin-top: 0.6em;
            flex-shrink: 0;
          }

          .document-content .bible-quote {
            border-left: 4px solid hsl(var(--primary) / 0.4);
            padding: 1em 1.25em;
            margin: 1.5em 0;
            background: hsl(var(--primary) / 0.05);
            border-radius: 0 8px 8px 0;
            font-style: italic;
          }

          .document-content.dark-mode .bible-quote {
            background: hsl(var(--primary) / 0.1);
          }

          .document-content .verse-ref {
            color: hsl(var(--primary));
            font-weight: 600;
            font-style: normal;
          }

          /* First paragraph styling */
          .document-content > .content-paragraph:first-of-type::first-letter {
            font-size: 3.5em;
            float: left;
            line-height: 0.8;
            padding-right: 0.1em;
            color: hsl(var(--primary));
            font-weight: 600;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
