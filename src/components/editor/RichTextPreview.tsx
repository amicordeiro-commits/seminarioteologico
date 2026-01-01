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
    .replace(/<[^>]*>/g, " ")
    .replace(/\*\*/g, "")
    .replace(/\*(?!\*)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Remove todas as tags HTML e retorna apenas o texto limpo
function stripAllHtmlTags(html: string): string {
  if (!html) return "";
  let text = html.replace(/<[^>]*>/g, " ");
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/\s+/g, " ");
  return text.trim();
}

function renderInline(text: string): ReactNode {
  if (!text) return null;

  // Se o conteúdo tem muitas tags HTML complexas, limpa tudo
  const htmlTagCount = (text.match(/<[^>]+>/g) || []).length;
  if (htmlTagCount > 10) {
    return stripAllHtmlTags(text);
  }

  const nodes: ReactNode[] = [];
  let remaining = text;

  const patterns = [
    { type: "div" as const, re: /<div[^>]*>([\s\S]*?)<\/div>/ },
    { type: "font" as const, re: /<font[^>]*>([\s\S]*?)<\/font>/ },
    { type: "p" as const, re: /<p[^>]*>([\s\S]*?)<\/p>/ },
    { type: "br" as const, re: /<br\s*\/?>/ },
    { type: "span" as const, re: /<span[^>]*>([\s\S]*?)<\/span>/ },
    { type: "u" as const, re: /<u>([\s\S]*?)<\/u>/ },
    { type: "b" as const, re: /<b>([\s\S]*?)<\/b>/ },
    { type: "strong" as const, re: /<strong>([\s\S]*?)<\/strong>/ },
    { type: "i" as const, re: /<i>([\s\S]*?)<\/i>/ },
    { type: "em" as const, re: /<em>([\s\S]*?)<\/em>/ },
    { type: "bold" as const, re: /\*\*([\s\S]+?)\*\*/ },
    { type: "italic" as const, re: /\*(?!\*)([\s\S]+?)\*(?!\*)/ },
  ];

  let iterations = 0;
  const maxIterations = 500;

  while (remaining.length && iterations < maxIterations) {
    iterations++;
    let best:
      | { type: (typeof patterns)[number]["type"]; index: number; match: RegExpMatchArray }
      | null = null;

    for (const p of patterns) {
      const m = remaining.match(p.re);
      if (!m || m.index == null) continue;
      if (!best || m.index < best.index) best = { type: p.type, index: m.index, match: m };
    }

    if (!best) {
      nodes.push(stripAllHtmlTags(remaining));
      break;
    }

    if (best.index > 0) {
      nodes.push(stripAllHtmlTags(remaining.slice(0, best.index)));
    }

    const full = best.match[0];
    const inner = best.match[1] ?? "";

    switch (best.type) {
      case "div":
      case "p":
        const divContent = renderInline(inner);
        if (divContent) {
          nodes.push(<span key={nodes.length}>{divContent} </span>);
        }
        break;
      case "font":
      case "span":
        nodes.push(<span key={nodes.length}>{renderInline(inner)}</span>);
        break;
      case "br":
        nodes.push(" ");
        break;
      case "u":
        nodes.push(
          <u key={nodes.length} className="underline decoration-primary/50 underline-offset-2">
            {renderInline(inner)}
          </u>
        );
        break;
      case "b":
      case "strong":
      case "bold":
        nodes.push(
          <strong key={nodes.length} className="font-bold text-foreground">
            {renderInline(inner)}
          </strong>
        );
        break;
      case "i":
      case "em":
      case "italic":
        nodes.push(
          <em key={nodes.length} className="italic">
            {renderInline(inner)}
          </em>
        );
        break;
    }

    remaining = remaining.slice(best.index + full.length);
  }

  if (iterations >= maxIterations && remaining.length) {
    nodes.push(stripAllHtmlTags(remaining));
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
