import { useEffect, useMemo, useState } from "react";
import { BookOpen, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getBookName } from "@/lib/bibleTypes";
import { Button } from "@/components/ui/button";

interface StudyCommentProps {
  comment: string;
  bookAbbrev: string;
  chapter: number;
  verse: number;
  verseText: string;
  autoComplete?: boolean;
}

// Cache for completed comments to avoid re-processing
const completedCommentsCache = new Map<string, string>();

// Very small concurrency limiter to avoid browser connection exhaustion
const MAX_CONCURRENT = 2;
let active = 0;
const waiters: Array<() => void> = [];

async function withSemaphore<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }
  active++;
  try {
    return await fn();
  } finally {
    active--;
    const next = waiters.shift();
    if (next) next();
  }
}

function isCommentLikelyIncomplete(comment: string): boolean {
  const t = comment.trim();
  if (!t) return false;

  // Strong OCR truncation signal
  if (t.endsWith("-") || t.endsWith("­")) return true;

  // Missing punctuation at end is only considered incomplete if it's long
  // (many short comments are fine without punctuation)
  const endsWithPunct = /[.!?:;]$/.test(t);
  if (!endsWithPunct && t.length >= 120) return true;

  return false;
}

function normalizeCompleted(text: string) {
  const t = text.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

export function StudyComment({
  comment,
  bookAbbrev,
  chapter,
  verse,
  verseText,
  autoComplete = true,
}: StudyCommentProps) {
  const cacheKey = useMemo(
    () => `${bookAbbrev}_${chapter}_${verse}_${comment.substring(0, 80)}`,
    [bookAbbrev, chapter, verse, comment]
  );

  const [displayComment, setDisplayComment] = useState(comment);
  const [isCompleting, setIsCompleting] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const shouldAuto = autoComplete && isCommentLikelyIncomplete(comment);

  useEffect(() => {
    setDisplayComment(comment);
    setWasCompleted(false);
    setError(null);

    const cached = completedCommentsCache.get(cacheKey);
    if (cached) {
      setDisplayComment(cached);
      setWasCompleted(true);
      return;
    }

    if (!shouldAuto) return;

    let cancelled = false;

    const run = async () => {
      setIsCompleting(true);
      setError(null);

      try {
        const result = await withSemaphore(async () => {
          // 2 retries for transient network errors
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              const { data, error: fnError } = await supabase.functions.invoke("complete-bible-comment", {
                body: {
                  comment,
                  verseText,
                  bookName: getBookName(bookAbbrev),
                  chapter,
                  verse,
                },
              });

              if (fnError) throw fnError;

              const completed = normalizeCompleted(data?.completedComment ?? comment);
              return { completed, wasCompleted: Boolean(data?.wasCompleted) };
            } catch (e) {
              if (attempt === 3) throw e;
              // backoff
              await new Promise((r) => setTimeout(r, 600 * attempt));
            }
          }

          return { completed: comment, wasCompleted: false };
        });

        if (cancelled) return;

        setDisplayComment(result.completed || comment);
        setWasCompleted(result.wasCompleted);

        if (result.wasCompleted) {
          completedCommentsCache.set(cacheKey, result.completed || comment);
        }
      } catch (err) {
        console.error("Failed to complete comment:", err);
        if (!cancelled) {
          setError("Não consegui completar agora. Clique em 'Tentar de novo'.");
          setDisplayComment(comment);
        }
      } finally {
        if (!cancelled) setIsCompleting(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [comment, bookAbbrev, chapter, verse, verseText, shouldAuto, cacheKey, retryNonce]);

  const showRetry = Boolean(error) || (shouldAuto && !isCompleting && !wasCompleted);

  return (
    <div className="p-3 bg-accent/30 rounded-lg border-l-4 border-accent text-sm leading-relaxed">
      <div className="flex items-start gap-2">
        <BookOpen className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />

        <div className="flex-1 space-y-2">
          {isCompleting ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Completando comentário...</span>
            </div>
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">{displayComment}</p>
          )}

          {error && <p className="text-destructive text-xs">{error}</p>}

          {showRetry && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRetryNonce((n) => n + 1)}
              disabled={isCompleting}
            >
              Tentar de novo
            </Button>
          )}
        </div>

        {wasCompleted && !isCompleting && (
          <span title="Completado por IA">
            <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
          </span>
        )}
      </div>
    </div>
  );
}
