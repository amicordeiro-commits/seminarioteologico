import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Play
} from "lucide-react";
import { Quiz, QuizAttempt } from "@/hooks/useQuizzes";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  quiz: Quiz;
  attempts?: QuizAttempt[];
  onStart: (quizId: string) => void;
}

export function QuizCard({ quiz, attempts = [], onStart }: QuizCardProps) {
  const bestAttempt = attempts
    .filter((a) => a.completed_at)
    .sort((a, b) => (b.score || 0) - (a.score || 0))[0];

  const hasPassed = bestAttempt?.passed;
  const attemptCount = attempts.filter((a) => a.completed_at).length;

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            hasPassed
              ? "bg-green-500/10 text-green-500"
              : "bg-primary/10 text-primary"
          )}
        >
          {hasPassed ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <FileText className="w-6 h-6" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-foreground">{quiz.title}</h3>
          {quiz.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {quiz.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {quiz.time_limit_minutes || "Sem limite"} min
            </Badge>
            <Badge variant="outline">
              Mínimo: {quiz.passing_score}%
            </Badge>
            {attemptCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {attemptCount} tentativa{attemptCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {bestAttempt && (
            <div className="mt-3 flex items-center gap-2">
              {hasPassed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )}
              <span className="text-sm">
                Melhor nota:{" "}
                <span
                  className={cn(
                    "font-medium",
                    hasPassed ? "text-green-500" : "text-destructive"
                  )}
                >
                  {bestAttempt.score}%
                </span>
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={() => onStart(quiz.id)}
          variant={hasPassed ? "outline" : "default"}
          size="sm"
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          {hasPassed ? "Refazer" : attemptCount > 0 ? "Tentar Novamente" : "Iniciar"}
        </Button>
      </div>
    </div>
  );
}
