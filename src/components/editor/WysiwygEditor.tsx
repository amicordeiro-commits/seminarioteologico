import { useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
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

const COLORS = [
  "#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#FFFFFF",
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
  "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#D946EF", "#EC4899", "#F43F5E", "#78350F",
];

const FONT_SIZES = [
  { label: "Pequeno", size: "12px" },
  { label: "Normal", size: "16px" },
  { label: "Médio", size: "18px" },
  { label: "Grande", size: "24px" },
  { label: "Muito Grande", size: "32px" },
  { label: "Título", size: "48px" },
];

export const WysiwygEditor = forwardRef<WysiwygEditorRef, WysiwygEditorProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const isInternalChange = useRef(false);

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      getContent: () => editorRef.current?.innerHTML || "",
    }));

    // Sincroniza o valor externo com o editor
    useEffect(() => {
      if (editorRef.current && !isInternalChange.current) {
        if (editorRef.current.innerHTML !== value) {
          editorRef.current.innerHTML = value || "";
        }
      }
      isInternalChange.current = false;
    }, [value]);

    const handleInput = useCallback(() => {
      if (editorRef.current) {
        isInternalChange.current = true;
        onChange(editorRef.current.innerHTML);
      }
    }, [onChange]);

    const execCommand = useCallback((command: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      handleInput();
    }, [handleInput]);

    const applyColor = useCallback((color: string) => {
      execCommand("foreColor", color);
    }, [execCommand]);

    const applyFontSize = useCallback((size: string) => {
      // Usa span com estilo inline para tamanho
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
        // Se surroundContents falhar (seleção atravessa nós), usa execCommand
        execCommand("fontSize", "7");
        // Depois ajusta o tamanho
        const fonts = editorRef.current?.querySelectorAll('font[size="7"]');
        fonts?.forEach(font => {
          const newSpan = document.createElement("span");
          newSpan.style.fontSize = size;
          newSpan.innerHTML = font.innerHTML;
          font.parentNode?.replaceChild(newSpan, font);
        });
        handleInput();
      }
    }, [execCommand, handleInput]);

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

    const ColorPicker = ({ onSelect, onClose }: { onSelect: (color: string) => void; onClose?: () => void }) => (
      <div className="grid grid-cols-6 gap-2 p-2">
        {COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className="w-8 h-8 rounded-lg border-2 border-border hover:scale-110 transition-transform active:scale-95"
            style={{ backgroundColor: color }}
            onClick={() => {
              onSelect(color);
              onClose?.();
            }}
          />
        ))}
      </div>
    );

    const SizePicker = ({ onSelect, onClose }: { onSelect: (size: string) => void; onClose?: () => void }) => (
      <div className="flex flex-col gap-1 p-2">
        {FONT_SIZES.map((option) => (
          <button
            key={option.size}
            type="button"
            className="px-3 py-2 text-left hover:bg-muted rounded text-sm"
            onClick={() => {
              onSelect(option.size);
              onClose?.();
            }}
          >
            <span style={{ fontSize: option.size }}>{option.label}</span>
          </button>
        ))}
      </div>
    );

    return (
      <div className={`flex flex-col gap-2 ${className || ""}`}>
        {/* Barra de Ferramentas */}
        <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 bg-muted/50 rounded-lg border overflow-x-auto">
          {/* Formatação de Texto */}
          <div className="flex items-center gap-0.5 pr-2 border-r">
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Negrito" onClick={() => execCommand("bold")}>
              <Bold className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Itálico" onClick={() => execCommand("italic")}>
              <Italic className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Sublinhado" onClick={() => execCommand("underline")}>
              <Underline className="w-4 h-4" />
            </Button>
          </div>

          {/* Cabeçalhos */}
          <div className="flex items-center gap-0.5 px-2 border-r">
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Título Principal" onClick={() => insertHeading(1)}>
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Subtítulo" onClick={() => insertHeading(2)}>
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Subtítulo Menor" onClick={() => insertHeading(3)}>
              <Heading3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Listas */}
          <div className="flex items-center gap-0.5 px-2 border-r">
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Lista com Marcadores" onClick={() => insertList(false)}>
              <List className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Lista Numerada" onClick={() => insertList(true)}>
              <ListOrdered className="w-4 h-4" />
            </Button>
          </div>

          {/* Alinhamento */}
          <div className="flex items-center gap-0.5 px-2 border-r">
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Alinhar à Esquerda" onClick={() => alignText("left")}>
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Centralizar" onClick={() => alignText("center")}>
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Justificar" onClick={() => alignText("justify")}>
              <AlignJustify className="w-4 h-4" />
            </Button>
          </div>

          {/* Cores */}
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-8 px-2 gap-1" title="Cor do Texto">
                  <Palette className="w-4 h-4" />
                  <span className="text-xs">Cor</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Cor do Texto</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <ColorPicker onSelect={applyColor} />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-8 px-2 gap-1" title="Cor do Texto">
                  <Palette className="w-4 h-4" />
                  <span className="text-xs">Cor</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <ColorPicker onSelect={applyColor} />
              </PopoverContent>
            </Popover>
          )}

          {/* Tamanho */}
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-8 px-2 gap-1" title="Tamanho da Fonte">
                  <Type className="w-4 h-4" />
                  <span className="text-xs">Tamanho</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Tamanho da Fonte</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <SizePicker onSelect={applyFontSize} />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-8 px-2 gap-1" title="Tamanho da Fonte">
                  <Type className="w-4 h-4" />
                  <span className="text-xs">Tamanho</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <SizePicker onSelect={applyFontSize} />
              </PopoverContent>
            </Popover>
          )}

          {/* Remover Formatação */}
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 gap-1 ml-auto" title="Remover Formatação" onClick={removeFormatting}>
            <Eraser className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Limpar</span>
          </Button>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-[300px] max-h-[400px] rounded-lg border bg-background overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-muted"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "hsl(var(--primary) / 0.3) hsl(var(--muted))",
          }}
        >
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[300px] p-4 outline-none text-sm leading-relaxed focus:ring-2 focus:ring-primary/20 rounded-lg"
            onInput={handleInput}
            onBlur={handleInput}
            data-placeholder={placeholder}
            style={{
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          />
        </div>
      </div>
    );
  }
);

WysiwygEditor.displayName = "WysiwygEditor";
