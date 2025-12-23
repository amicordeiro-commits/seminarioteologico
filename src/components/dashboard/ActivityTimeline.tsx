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
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const config = typeConfig[activity.type];
        const Icon = config.icon;

        return (
          <div
            key={activity.id}
            className={cn(
              "relative flex gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 group cursor-pointer",
              activity.completed && "opacity-60"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border",
                config.color
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4
                    className={cn(
                      "font-medium text-foreground group-hover:text-primary transition-colors",
                      activity.completed && "line-through"
                    )}
                  >
                    {activity.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{activity.course}</p>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full border",
                    config.color
                  )}
                >
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {activity.dueDate}
                </span>
              </div>
            </div>
            {activity.completed && (
              <CheckCircle2 className="w-5 h-5 text-success absolute top-4 right-4" />
            )}
          </div>
        );
      })}
    </div>
  );
}
