import { Calendar, Clock, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  title: string;
  course: string;
  type: "assignment" | "quiz" | "lesson" | "deadline";
  dueDate: string;
  completed?: boolean;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const typeConfig = {
  assignment: {
    icon: BookOpen,
    color: "bg-primary/10 text-primary border-primary/30",
    label: "Tarefa",
  },
  quiz: {
    icon: CheckCircle2,
    color: "bg-accent/10 text-accent border-accent/30",
    label: "Quiz",
  },
  lesson: {
    icon: BookOpen,
    color: "bg-success/10 text-success border-success/30",
    label: "Aula",
  },
  deadline: {
    icon: Clock,
    color: "bg-destructive/10 text-destructive border-destructive/30",
    label: "Prazo",
  },
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="space-y-2 sm:space-y-4">
      {activities.map((activity, index) => {
        const config = typeConfig[activity.type];
        const Icon = config.icon;

        return (
          <div
            key={activity.id}
            className={cn(
              "relative flex gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border bg-card hover:shadow-md transition-all duration-200 group cursor-pointer",
              activity.completed && "opacity-60"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0 border",
                config.color
              )}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1 sm:gap-2">
                <div className="min-w-0 flex-1">
                  <h4
                    className={cn(
                      "font-medium text-foreground group-hover:text-primary transition-colors text-sm sm:text-base truncate",
                      activity.completed && "line-through"
                    )}
                  >
                    {activity.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{activity.course}</p>
                </div>
                <span
                  className={cn(
                    "text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border flex-shrink-0",
                    config.color
                  )}
                >
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {activity.dueDate}
                </span>
              </div>
            </div>
            {activity.completed && (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success absolute top-3 right-3 sm:top-4 sm:right-4" />
            )}
          </div>
        );
      })}
    </div>
  );
}
