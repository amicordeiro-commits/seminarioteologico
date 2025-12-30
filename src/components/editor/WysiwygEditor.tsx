import { useRef, useCallback, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Palette,
  Type,
  Eraser,
  Undo,
  Redo,
  Highlighter,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface WysiwygEditorRef {
  focus: () => void;
  getContent: () => string;
}

// Paleta de cores organizada por categoria
const COLOR_CATEGORIES = [
  {
    name: "Básicas",
    colors: ["#000000", "#FFFFFF", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB"],
  },
  {
    name: "Vibrantes",
    colors: ["#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E"],
  },
  {
    name: "Frias",
    colors: ["#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1"],
  },
  {
    name: "Roxas/Rosas",
    colors: ["#8B5CF6", "#A855F7", "#D946EF", "#EC4899", "#F43F5E", "#BE185D"],
  },
];

const HIGHLIGHT_COLORS = [
  { name: "Amarelo", color: "#FEF08A" },
  { name: "Verde", color: "#BBF7D0" },
  { name: "Azul", color: "#BFDBFE" },
  { name: "Rosa", color: "#FBCFE8" },
  { name: "Laranja", color: "#FED7AA" },
  { name: "Roxo", color: "#DDD6FE" },
];

const FONT_SIZES = [
  { label: "Pequeno", size: "12px", preview: "Aa" },
  { label: "Normal", size: "16px", preview: "Aa" },
  { label: "Médio", size: "18px", preview: "Aa" },
  { label: "Grande", size: "24px", preview: "Aa" },
  { label: "Muito Grande", size: "32px", preview: "Aa" },
  { label: "Título", size: "48px", preview: "Aa" },
];

export const WysiwygEditor = forwardRef<WysiwygEditorRef, WysiwygEditorProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const isInternalChange = useRef(false);
    const savedSelectionRef = useRef<Range | null>(null);
    const [activeColor, setActiveColor] = useState("#000000");

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      getContent: () => editorRef.current?.innerHTML || "",
    }));

    useEffect(() => {
      if (editorRef.current && !isInternalChange.current) {
        if (editorRef.current.innerHTML !== value) {
          editorRef.current.innerHTML = value || "";
        }
      }
      isInternalChange.current = false;
    }, [value]);

    const saveSelection = useCallback(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      if (!editorRef.current) return;

      const range = selection.getRangeAt(0);
      if (!editorRef.current.contains(range.commonAncestorContainer)) return;

      savedSelectionRef.current = range.cloneRange();
    }, []);

    const restoreSelection = useCallback(() => {
      const selection = window.getSelection();
      const range = savedSelectionRef.current;
      if (!selection || !range) return;
      selection.removeAllRanges();
      selection.addRange(range);
    }, []);

    const handleInput = useCallback(() => {
      if (editorRef.current) {
        isInternalChange.current = true;
        onChange(editorRef.current.innerHTML);
      }
    }, [onChange]);

    const execCommand = useCallback(
      (command: string, value?: string) => {
        restoreSelection();
        editorRef.current?.focus();
        document.execCommand(command, false, value);
        handleInput();
      },
      [handleInput, restoreSelection],
    );

    const applyColor = useCallback((color: string) => {
      setActiveColor(color);
      execCommand("foreColor", color);
    }, [execCommand]);

    const applyHighlight = useCallback((color: string) => {
      execCommand("hiliteColor", color);
    }, [execCommand]);

    const applyFontSize = useCallback(
      (size: string) => {
        restoreSelection();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        if (range.collapsed) return;

        const span = document.createElement("span");
        span.style.fontSize = size;

        try {
          range.surroundContents(span);
          handleInput();
        } catch {
          execCommand("fontSize", "7");
          const fonts = editorRef.current?.querySelectorAll('font[size="7"]');
          fonts?.forEach((font) => {
            const newSpan = document.createElement("span");
            newSpan.style.fontSize = size;
            newSpan.innerHTML = font.innerHTML;
            font.parentNode?.replaceChild(newSpan, font);
          });
          handleInput();
        }
      },
      [execCommand, handleInput, restoreSelection],
    );

    const removeFormatting = useCallback(() => {
      execCommand("removeFormat");
    }, [execCommand]);

    const insertHeading = useCallback((level: 1 | 2 | 3) => {
      execCommand("formatBlock", `h${level}`);
    }, [execCommand]);

    const insertList = useCallback((ordered: boolean) => {
      execCommand(ordered ? "insertOrderedList" : "insertUnorderedList");
    }, [execCommand]);

    const alignText = useCallback((align: "left" | "center" | "justify") => {
      const command = align === "left" ? "justifyLeft" : align === "center" ? "justifyCenter" : "justifyFull";
      execCommand(command);
    }, [execCommand]);

    // Botões de cor rápida
    const QUICK_COLORS = [
      { name: "Vermelho", color: "#EF4444" },
      { name: "Azul", color: "#3B82F6" },
      { name: "Verde", color: "#22C55E" },
      { name: "Roxo", color: "#8B5CF6" },
      { name: "Laranja", color: "#F97316" },
      { name: "Rosa", color: "#EC4899" },
    ];

    const ColorPickerContent = forwardRef<
      HTMLDivElement,
      { onSelect: (color: string) => void; onClose?: () => void }
    >(({ onSelect, onClose }, forwardedRef) => (
      <div ref={forwardedRef} className="p-3 space-y-3 min-w-[280px]">
        {COLOR_CATEGORIES.map((category) => (
          <div key={category.name}>
            <p className="text-xs font-medium text-muted-foreground mb-2">{category.name}</p>
            <div className="grid grid-cols-6 gap-2">
              {category.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  className={`w-8 h-8 rounded-lg border-2 transition-all duration-150 hover:scale-110 active:scale-95 shadow-sm ${
                    activeColor === color ? "ring-2 ring-primary ring-offset-2" : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onSelect(color);
                    onClose?.();
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    ));
    ColorPickerContent.displayName = "ColorPickerContent";

    const HighlightPickerContent = forwardRef<
      HTMLDivElement,
      { onSelect: (color: string) => void; onClose?: () => void }
    >(({ onSelect, onClose }, forwardedRef) => (
      <div ref={forwardedRef} className="p-3 space-y-2 min-w-[200px]">
        <p className="text-xs font-medium text-muted-foreground mb-2">Destaque</p>
        <div className="grid grid-cols-3 gap-2">
          {HIGHLIGHT_COLORS.map((item) => (
            <button
              key={item.color}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => {
                onSelect(item.color);
                onClose?.();
              }}
            >
              <div
                className="w-8 h-8 rounded-lg border border-border shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-muted-foreground">{item.name}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          className="w-full mt-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-2"
          onClick={() => {
            onSelect("transparent");
            onClose?.();
          }}
        >
          <Eraser className="w-3 h-3" />
          Remover destaque
        </button>
      </div>
    ));
    HighlightPickerContent.displayName = "HighlightPickerContent";

    const SizePickerContent = forwardRef<
      HTMLDivElement,
      { onSelect: (size: string) => void; onClose?: () => void }
    >(({ onSelect, onClose }, forwardedRef) => (
      <div ref={forwardedRef} className="p-2 space-y-1 min-w-[180px]">
        {FONT_SIZES.map((option) => (
          <button
            key={option.size}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            className="w-full px-3 py-2 text-left hover:bg-muted rounded-lg transition-colors flex items-center justify-between group"
            onClick={() => {
              onSelect(option.size);
              onClose?.();
            }}
          >
            <span className="text-sm">{option.label}</span>
            <span
              className="text-muted-foreground group-hover:text-foreground transition-colors font-serif"
              style={{ fontSize: option.size, lineHeight: 1 }}
            >
              {option.preview}
            </span>
          </button>
        ))}
      </div>
    ));
    SizePickerContent.displayName = "SizePickerContent";

    const ToolbarButton = ({
      onClick,
      title,
      children,
      active = false,
    }: {
      onClick: () => void;
      title: string;
      children: React.ReactNode;
      active?: boolean;
    }) => (
      <Button
        type="button"
        variant={active ? "secondary" : "ghost"}
        size="sm"
        className={`h-9 w-9 p-0 transition-all ${active ? "bg-primary/20 text-primary" : "hover:bg-primary/10 hover:text-primary"}`}
        title={title}
        onMouseDown={(e) => {
          e.preventDefault();
          saveSelection();
        }}
        onClick={onClick}
      >
        {children}
      </Button>
    );

    const ToolbarGroup = ({ children }: { children: React.ReactNode }) => (
      <div className="flex items-center gap-0.5 px-1 first:pl-0 last:pr-0 border-r border-border/50 last:border-r-0">
        {children}
      </div>
    );

    return (
      <div className={`flex flex-col gap-3 ${className || ""}`}>
        {/* Barra de Ferramentas Premium */}
        <div className="bg-gradient-to-r from-card via-card to-card/80 rounded-xl border border-border/50 shadow-sm p-2 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-1">
            {/* Desfazer/Refazer */}
            <ToolbarGroup>
              <ToolbarButton title="Desfazer (Ctrl+Z)" onClick={() => execCommand("undo")}>
                <Undo className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton title="Refazer (Ctrl+Y)" onClick={() => execCommand("redo")}>
                <Redo className="w-4 h-4" />
              </ToolbarButton>
            </ToolbarGroup>

            {/* Formatação de Texto */}
            <ToolbarGroup>
              <ToolbarButton title="Negrito (Ctrl+B)" onClick={() => execCommand("bold")}>
                <Bold className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton title="Itálico (Ctrl+I)" onClick={() => execCommand("italic")}>
                <Italic className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton title="Sublinhado (Ctrl+U)" onClick={() => execCommand("underline")}>
                <Underline className="w-4 h-4" />
              </ToolbarButton>
            </ToolbarGroup>

            {/* Cabeçalhos */}
            <ToolbarGroup>
              <ToolbarButton title="Título Principal" onClick={() => insertHeading(1)}>
                <Heading1 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton title="Subtítulo" onClick={() => insertHeading(2)}>
                <Heading2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton title="Subtítulo Menor" onClick={() => insertHeading(3)}>
                <Heading3 className="w-4 h-4" />
              </ToolbarButton>
            </ToolbarGroup>

            {/* Listas */}
            <ToolbarGroup>
              <ToolbarButton title="Lista com Marcadores" onClick={() => insertList(false)}>
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton title="Lista Numerada" onClick={() => insertList(true)}>
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>
            </ToolbarGroup>

            {/* Alinhamento */}
            <ToolbarGroup>
              <ToolbarButton title="Alinhar à Esquerda" onClick={() => alignText("left")}>
                <AlignLeft className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton title="Centralizar" onClick={() => alignText("center")}>
                <AlignCenter className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton title="Justificar" onClick={() => alignText("justify")}>
                <AlignJustify className="w-4 h-4" />
              </ToolbarButton>
            </ToolbarGroup>

            {/* Cores Rápidas */}
            <ToolbarGroup>
              <div className="flex items-center gap-1">
                {QUICK_COLORS.map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    title={item.name}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      saveSelection();
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-150 hover:scale-110 active:scale-95 shadow-sm ${
                      activeColor === item.color ? "ring-2 ring-primary ring-offset-1" : "border-border/70"
                    }`}
                    style={{ backgroundColor: item.color }}
                    onClick={() => applyColor(item.color)}
                  />
                ))}
              </div>
            </ToolbarGroup>

            {/* Mais Cores e Tamanho */}
            <ToolbarGroup>
              {isMobile ? (
                <>
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-9 px-2.5 gap-1.5 hover:bg-primary/10" title="Cor do Texto">
                        <div className="relative">
                          <Palette className="w-4 h-4" />
                          <div 
                            className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-full" 
                            style={{ backgroundColor: activeColor }}
                          />
                        </div>
                        <span className="text-xs font-medium">Cor</span>
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Cor do Texto</DrawerTitle>
                      </DrawerHeader>
                      <ColorPickerContent onSelect={applyColor} />
                    </DrawerContent>
                  </Drawer>
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-9 px-2.5 gap-1.5 hover:bg-primary/10" title="Destaque">
                        <Highlighter className="w-4 h-4" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Destaque</DrawerTitle>
                      </DrawerHeader>
                      <HighlightPickerContent onSelect={applyHighlight} />
                    </DrawerContent>
                  </Drawer>
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-9 px-2.5 gap-1.5 hover:bg-primary/10" title="Tamanho">
                        <Type className="w-4 h-4" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Tamanho da Fonte</DrawerTitle>
                      </DrawerHeader>
                      <SizePickerContent onSelect={applyFontSize} />
                    </DrawerContent>
                  </Drawer>
                </>
              ) : (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-9 px-2.5 gap-1.5 hover:bg-primary/10" title="Cor do Texto">
                        <div className="relative">
                          <Palette className="w-4 h-4" />
                          <div 
                            className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-full" 
                            style={{ backgroundColor: activeColor }}
                          />
                        </div>
                        <span className="text-xs font-medium">Cor</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border shadow-xl" align="start">
                      <ColorPickerContent onSelect={applyColor} />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-primary/10" title="Destaque">
                        <Highlighter className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border shadow-xl" align="start">
                      <HighlightPickerContent onSelect={applyHighlight} />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="h-9 px-2.5 gap-1.5 hover:bg-primary/10" title="Tamanho da Fonte">
                        <Type className="w-4 h-4" />
                        <span className="text-xs font-medium">Tamanho</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border shadow-xl" align="start">
                      <SizePickerContent onSelect={applyFontSize} />
                    </PopoverContent>
                  </Popover>
                </>
              )}
            </ToolbarGroup>

            {/* Limpar Formatação */}
            <div className="ml-auto">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-9 px-2.5 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                title="Remover Formatação" 
                onClick={removeFormatting}
              >
                <Eraser className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline">Limpar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Premium */}
        <div 
          className="flex-1 min-h-[350px] max-h-[500px] rounded-xl border-2 border-border/50 bg-gradient-to-b from-background to-muted/20 overflow-hidden shadow-inner"
        >
          <div 
            className="h-full overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "hsl(var(--primary) / 0.3) transparent",
            }}
          >
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[350px] p-5 outline-none text-base leading-relaxed focus:bg-background/50 transition-colors"
              onInput={handleInput}
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              onBlur={() => {
                saveSelection();
                handleInput();
              }}
              data-placeholder={placeholder}
              style={{
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            />
          </div>
        </div>

        {/* Dica */}
        <p className="text-xs text-muted-foreground text-center">
          Selecione o texto para aplicar formatação • Use Ctrl+B para negrito, Ctrl+I para itálico
        </p>
      </div>
    );
  }
);

WysiwygEditor.displayName = "WysiwygEditor";