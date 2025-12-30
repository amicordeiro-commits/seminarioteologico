import type { CSSProperties, ReactNode } from "react";

function parseSpanStyle(style: string): CSSProperties | undefined {
  const out: CSSProperties = {};

  const colorMatch = style.match(/color:\s*([^;]+)\s*;?/i);
  if (colorMatch) {
    const c = colorMatch[1].trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)) out.color = c;
  }

  const sizeMatch = style.match(/font-size:\s*(\d+(?:\.\d+)?px)\s*;?/i);
  if (sizeMatch) out.fontSize = sizeMatch[1];

  return Object.keys(out).length ? out : undefined;
}

function unwrapTextAlignBlock(text: string): { align: CSSProperties["textAlign"]; inner: string } | null {
  const m = text.match(/^<div style="text-align:\s*(left|center|right|justify)\s*">([\s\S]*)<\/div>$/i);
  if (!m) return null;
  return { align: m[1] as CSSProperties["textAlign"], inner: m[2] };
}

function stripInlineMarkup(text: string): string {
  return (text || "")
    .replace(/<span style="[^"]+">/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/<u>/gi, "")
    .replace(/<\/u>/gi, "")
    .replace(/\*\*/g, "")
    .replace(/\*(?!\*)/g, "");
}

function renderInline(text: string): ReactNode {
  if (!text) return null;

  const nodes: ReactNode[] = [];
  let remaining = text;

  const patterns = [
    { type: "span" as const, re: /<span style="([^"]+)">([\s\S]*?)<\/span>/ },
    { type: "u" as const, re: /<u>([\s\S]*?)<\/u>/ },
    { type: "bold" as const, re: /\*\*([\s\S]+?)\*\*/ },
    { type: "italic" as const, re: /\*(?!\*)([\s\S]+?)\*(?!\*)/ },
  ];

  while (remaining.length) {
    let best:
      | { type: (typeof patterns)[number]["type"]; index: number; match: RegExpMatchArray }
      | null = null;

    for (const p of patterns) {
      const m = remaining.match(p.re);
      if (!m || m.index == null) continue;
      if (!best || m.index < best.index) best = { type: p.type, index: m.index, match: m };
    }

    if (!best) {
      nodes.push(remaining);
      break;
    }

    if (best.index > 0) nodes.push(remaining.slice(0, best.index));

    const full = best.match[0];

    if (best.type === "span") {
      const style = parseSpanStyle(best.match[1]);
      const inner = best.match[2] ?? "";
      nodes.push(
        <span key={nodes.length} style={style}>
          {renderInline(inner)}
        </span>,
      );
    } else if (best.type === "u") {
      const inner = best.match[1] ?? "";
      nodes.push(
        <u key={nodes.length} className="underline decoration-primary/50 underline-offset-2">
          {renderInline(inner)}
        </u>
      );
    } else if (best.type === "bold") {
      const inner = best.match[1] ?? "";
      nodes.push(
        <strong key={nodes.length} className="font-bold text-foreground">
          {renderInline(inner)}
        </strong>
      );
    } else if (best.type === "italic") {
      const inner = best.match[1] ?? "";
      nodes.push(
        <em key={nodes.length} className="italic">
          {renderInline(inner)}
        </em>
      );
    }

    remaining = remaining.slice(best.index + full.length);
  }

  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

function splitIntoBlocks(text: string): string[] {
  const t = (text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return t
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
}

export function RichTextPreview({ content }: { content: string }) {
  const blocks = splitIntoBlocks(content);

  if (!content.trim()) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
          <svg className="w-6 h-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm">Nada para pré-visualizar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      {blocks.map((raw, i) => {
        const unwrapped = unwrapTextAlignBlock(raw);
        const align = unwrapped?.align;
        const display = (unwrapped?.inner ?? raw).trim();
        const detect = stripInlineMarkup(display).trim();

        // Títulos markdown
        if (/^###\s+/.test(display)) {
          return (
            <h4 key={i} className="text-base font-semibold text-foreground border-l-2 border-primary/40 pl-3">
              {renderInline(display.replace(/^###\s+/, ""))}
            </h4>
          );
        }
        if (/^##\s+/.test(display)) {
          return (
            <h3 key={i} className="text-lg font-semibold text-foreground border-l-3 border-primary/50 pl-3">
              {renderInline(display.replace(/^##\s+/, ""))}
            </h3>
          );
        }
        if (/^#\s+/.test(display)) {
          return (
            <h2 key={i} className="text-xl font-bold text-foreground border-l-4 border-primary pl-4 py-1 bg-primary/5 rounded-r">
              {renderInline(display.replace(/^#\s+/, ""))}
            </h2>
          );
        }

        // Título em maiúsculas
        const isMainHeading =
          /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,.()]+$/.test(detect) &&
          detect.length < 80 &&
          !detect.includes(".");
        
        if (isMainHeading) {
          return (
            <div key={i} className="relative py-2">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-full" />
              <h2 className="pl-4 text-base font-serif font-bold text-primary">
                {renderInline(display)}
              </h2>
            </div>
          );
        }

        // Subtópico numerado
        const isNumberedTopic = /^[IVX]+[\.\)]\s/.test(detect) || /^\d+[\.\)]\s/.test(detect);
        if (isNumberedTopic) {
          const num = detect.match(/^([IVX\d]+)/)?.[1];
          const body = display.replace(/^[IVX\d]+[\.\)]\s*/, "");
          return (
            <div key={i} className="flex items-start gap-3 bg-muted/40 rounded-lg p-3 border border-border/50">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">
                {num}
              </div>
              <p className="text-sm font-medium text-foreground pt-1">
                {renderInline(body)}
              </p>
            </div>
          );
        }

        // Subtópico com letra
        const isLetterTopic = /^[a-zA-Z][\.\)]\s/.test(detect) && detect.length < 200;
        if (isLetterTopic) {
          const letter = detect.charAt(0).toUpperCase();
          const body = display.replace(/^[a-zA-Z][\.\)]\s*/, "");
          return (
            <div key={i} className="ml-4 flex items-start gap-2 border-l-2 border-primary/30 pl-3 py-1">
              <span className="text-primary font-bold text-sm">{letter}.</span>
              <p className="text-sm text-muted-foreground">
                {renderInline(body)}
              </p>
            </div>
          );
        }

        // Bullet point
        const isBulletPoint = /^[-•]\s/.test(detect);
        if (isBulletPoint) {
          const body = display.replace(/^[-•]\s*/, "");
          return (
            <div key={i} className="ml-4 flex items-start gap-2">
              <span className="text-primary text-lg mt-0.5">•</span>
              <p className="text-sm text-muted-foreground">
                {renderInline(body)}
              </p>
            </div>
          );
        }

        // Parágrafo normal
        return (
          <p 
            key={i} 
            className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground" 
            style={{ textAlign: align, textIndent: align === "justify" ? "1em" : undefined }}
          >
            {renderInline(display)}
          </p>
        );
      })}
    </div>
  );
}
