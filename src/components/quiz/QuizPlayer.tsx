import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ChevronLeft,
  Award,
  RotateCcw
} from "lucide-react";
import { useQuiz, useQuizQuestions, useSubmitQuiz } from "@/hooks/useQuizzes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuizPlayerProps {
  quizId: string;
  onComplete?: (passed: boolean, score: number) => void;
  onClose?: () => void;
}

export function QuizPlayer({ quizId, onComplete, onClose }: QuizPlayerProps) {
  const { data: quiz } = useQuiz(quizId);
  const { data: questions } = useQuizQuestions(quizId);
  const submitQuiz = useSubmitQuiz();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<{ score: number; passed: boolean } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  if (!quiz || !questions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (optionId: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    let totalPoints = 0;

    questions.forEach((question) => {
      totalPoints += question.points;
      const selectedOption = question.options.find(
        (o) => o.id === answers[question.id]
      );
      if (selectedOption?.is_correct) {
        correct += question.points;
      }
    });

    return Math.round((correct / totalPoints) * 100);
  };

  const handleSubmit = async () => {
    if (answeredCount < questions.length) {
      toast.error("Responda todas as perguntas antes de enviar");
      return;
    }

    const score = calculateScore();
    const passed = score >= (quiz.passing_score || 70);

    try {
      await submitQuiz.mutateAsync({
        quizId,
        answers,
        score,
        passed,
      });

      setResults({ score, passed });
      setIsSubmitted(true);
      onComplete?.(passed, score);

      if (passed) {
        toast.success("Parabéns! Você passou no quiz!");
      } else {
        toast.error("Você não atingiu a pontuação mínima");
      }
    } catch (error) {
      toast.error("Erro ao enviar quiz");
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setResults(null);
  };

  // Results screen
  if (isSubmitted && results) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 max-w-2xl mx-auto text-center space-y-6">
        <div
          className={cn(
            "w-24 h-24 rounded-full mx-auto flex items-center justify-center",
            results.passed
              ? "bg-green-500/10 text-green-500"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {results.passed ? (
            <Award className="w-12 h-12" />
          ) : (
            <XCircle className="w-12 h-12" />
          )}
        </div>

        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">
            {results.passed ? "Parabéns!" : "Não foi dessa vez"}
          </h2>
          <p className="text-muted-foreground mt-2">
            {results.passed
              ? "Você completou o quiz com sucesso!"
              : "Continue estudando e tente novamente."}
          </p>
        </div>

        <div className="bg-background rounded-xl p-6 border border-border">
          <p className="text-sm text-muted-foreground">Sua pontuação</p>
          <p
            className={cn(
              "text-5xl font-bold",
              results.passed ? "text-green-500" : "text-destructive"
            )}
          >
            {results.score}%
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Mínimo necessário: {quiz.passing_score}%
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          {!results.passed && (
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          )}
          <Button onClick={onClose}>Voltar ao Curso</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-semibold text-foreground">
            {quiz.title}
          </h2>
          {quiz.time_limit_minutes && (
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {quiz.time_limit_minutes} min
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {currentIndex + 1} de {questions.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="p-6 space-y-6">
        <div>
          <Badge variant="secondary" className="mb-3">
            Questão {currentIndex + 1}
          </Badge>
          <h3 className="text-lg font-medium text-foreground">
            {currentQuestion.question_text}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[currentQuestion.id] === option.id;
            const letter = String.fromCharCode(65 + index);

            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                disabled={isSubmitted}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {letter}
                </span>
                <span className="flex-1 text-foreground">{option.option_text}</span>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <span className="text-sm text-muted-foreground">
          {answeredCount} de {questions.length} respondidas
        </span>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={submitQuiz.isPending}
            className="gap-2"
          >
            {submitQuiz.isPending ? "Enviando..." : "Enviar Quiz"}
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-2">
            Próxima
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
