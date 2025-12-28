import { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getBookName } from '@/lib/bibleTypes';

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

function isCommentIncomplete(comment: string): boolean {
  const trimmed = comment.trim();
  // Check for signs of incomplete text
  return (
    !trimmed.match(/[.!?:;]$/) || // Doesn't end with punctuation
    trimmed.endsWith('-') ||
    trimmed.endsWith('­') ||
    trimmed.endsWith(',') ||
    trimmed.length < 50
  );
}

export function StudyComment({ 
  comment, 
  bookAbbrev, 
  chapter, 
  verse, 
  verseText,
  autoComplete = true 
}: StudyCommentProps) {
  const [displayComment, setDisplayComment] = useState(comment);
  const [isCompleting, setIsCompleting] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `${bookAbbrev}_${chapter}_${verse}_${comment.substring(0, 50)}`;

  useEffect(() => {
    // Check cache first
    const cached = completedCommentsCache.get(cacheKey);
    if (cached) {
      setDisplayComment(cached);
      setWasCompleted(true);
      return;
    }

    // Only auto-complete if enabled and comment appears incomplete
    if (!autoComplete || !isCommentIncomplete(comment)) {
      setDisplayComment(comment);
      return;
    }

    const completeComment = async () => {
      setIsCompleting(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('complete-bible-comment', {
          body: {
            comment,
            verseText,
            bookName: getBookName(bookAbbrev),
            chapter,
            verse,
          },
        });

        if (fnError) {
          console.error('Error completing comment:', fnError);
          setError('Erro ao completar comentário');
          setDisplayComment(comment);
        } else if (data?.completedComment) {
          setDisplayComment(data.completedComment);
          setWasCompleted(data.wasCompleted || false);
          
          // Cache the result
          if (data.wasCompleted) {
            completedCommentsCache.set(cacheKey, data.completedComment);
          }
        } else {
          setDisplayComment(comment);
        }
      } catch (err) {
        console.error('Failed to complete comment:', err);
        setError('Falha na conexão');
        setDisplayComment(comment);
      } finally {
        setIsCompleting(false);
      }
    };

    // Small delay to avoid too many simultaneous requests
    const timer = setTimeout(completeComment, Math.random() * 500);
    return () => clearTimeout(timer);
  }, [comment, bookAbbrev, chapter, verse, verseText, autoComplete, cacheKey]);

  return (
    <div className="p-3 bg-accent/30 rounded-lg border-l-4 border-accent text-sm leading-relaxed relative">
      <div className="flex items-start gap-2">
        <BookOpen className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          {isCompleting ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Completando comentário...</span>
            </div>
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">{displayComment}</p>
          )}
          
          {error && (
            <p className="text-destructive text-xs mt-1">{error}</p>
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
