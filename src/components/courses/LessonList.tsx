import { cn } from "@/lib/utils";
import {
  Play,
  CheckCircle,
  Lock,
  Clock,
  FileText,
  BookOpen,
  HelpCircle,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  type: "video" | "reading" | "quiz";
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
}

interface LessonListProps {
  lessons: Lesson[];
  currentLessonId?: number;
  onSelectLesson: (lesson: Lesson) => void;
}

const typeIcons = {
  video: Play,
  reading: BookOpen,
  quiz: HelpCircle,
};

const typeLabels = {
  video: "Vídeo",
  reading: "Leitura",
  quiz: "Quiz",
};

export function LessonList({
  lessons,
  currentLessonId,
  onSelectLesson,
}: LessonListProps) {
  return (
    <div className="space-y-2">
      {lessons.map((lesson, index) => {
        const Icon = typeIcons[lesson.type];
        const isActive = lesson.id === currentLessonId;

        return (
          <button
            key={lesson.id}
            onClick={() => !lesson.isLocked && onSelectLesson(lesson)}
            disabled={lesson.isLocked}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all",
              isActive
                ? "bg-primary/10 border-2 border-primary"
                : lesson.isLocked
                ? "bg-muted/50 cursor-not-allowed opacity-60"
                : "bg-card border border-border hover:border-primary/30 hover:bg-accent/50"
            )}
          >
            {/* Index / Status */}
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-medium",
                lesson.isCompleted
                  ? "bg-green-500/10 text-green-600"
                  : lesson.isLocked
                  ? "bg-muted text-muted-foreground"
                  : isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary"
              )}
            >
              {lesson.isCompleted ? (
                <CheckCircle className="w-5 h-5" />
              ) : lesson.isLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  "font-medium truncate",
                  isActive ? "text-primary" : "text-foreground"
                )}
              >
                {lesson.title}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  {typeLabels[lesson.type]}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lesson.duration}
                </span>
              </div>
            </div>

            {/* Play indicator */}
            {!lesson.isLocked && !lesson.isCompleted && (
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <Play className="w-4 h-4 ml-0.5" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
