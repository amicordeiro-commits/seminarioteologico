import type { CSSProperties, ReactNode } from "react";

function parseSpanStyle(style: string): CSSProperties | undefined {
  const out: CSSProperties = {};

  const colorMatch = style.match(/color:\s*([^;]+)\s*;?/i);
  if (colorMatch) {
    const c = colorMatch[1].trim();
    // aceita hex (gerado pelo editor)
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
      nodes.push(<u key={nodes.length}>{renderInline(inner)}</u>);
    } else if (best.type === "bold") {
      const inner = best.match[1] ?? "";
      nodes.push(<strong key={nodes.length}>{renderInline(inner)}</strong>);
    } else if (best.type === "italic") {
      const inner = best.match[1] ?? "";
      nodes.push(<em key={nodes.length}>{renderInline(inner)}</em>);
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
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Nada para pré-visualizar
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((raw, i) => {
        const unwrapped = unwrapTextAlignBlock(raw);
        const align = unwrapped?.align;
        const display = (unwrapped?.inner ?? raw).trim();

        // títulos simples por markdown
        if (/^###\s+/.test(display)) {
          return (
            <h4 key={i} className="text-lg font-semibold">
              {renderInline(display.replace(/^###\s+/, ""))}
            </h4>
          );
        }
        if (/^##\s+/.test(display)) {
          return (
            <h3 key={i} className="text-xl font-semibold">
              {renderInline(display.replace(/^##\s+/, ""))}
            </h3>
          );
        }
        if (/^#\s+/.test(display)) {
          return (
            <h2 key={i} className="text-2xl font-bold">
              {renderInline(display.replace(/^#\s+/, ""))}
            </h2>
          );
        }

        return (
          <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap" style={{ textAlign: align }}>
            {renderInline(display)}
          </p>
        );
      })}
    </div>
  );
}
