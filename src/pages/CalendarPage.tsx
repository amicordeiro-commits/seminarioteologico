import { AppLayout } from "@/components/layout/AppLayout";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { Button } from "@/components/ui/button";
import { Plus, Clock, BookOpen, Video, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const upcomingEvents = [
  {
    id: "1",
    title: "Aula ao vivo: Hooks Avançados",
    course: "Desenvolvimento Web Completo",
    time: "19:00 - 20:30",
    date: "Hoje",
    type: "live" as const,
  },
  {
    id: "2",
    title: "Prazo: Entrega do Projeto Final",
    course: "Python para Data Science",
    time: "23:59",
    date: "Amanhã",
    type: "deadline" as const,
  },
  {
    id: "3",
    title: "Quiz: Fundamentos de UX",
    course: "UX/UI Design",
    time: "10:00 - 10:30",
    date: "25 Dez",
    type: "quiz" as const,
  },
  {
    id: "4",
    title: "Mentoria Individual",
    course: "Marketing Digital",
    time: "14:00 - 14:45",
    date: "26 Dez",
    type: "mentoring" as const,
  },
];

const typeConfig = {
  live: { icon: Video, color: "bg-accent/10 text-accent border-accent/30" },
  deadline: { icon: Clock, color: "bg-destructive/10 text-destructive border-destructive/30" },
  quiz: { icon: FileText, color: "bg-primary/10 text-primary border-primary/30" },
  mentoring: { icon: BookOpen, color: "bg-success/10 text-success border-success/30" },
};

const CalendarPage = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
            <p className="text-muted-foreground">Acompanhe suas aulas e prazos</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Evento
          </Button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <CalendarWidget
              events={[
                { date: new Date(), title: "Aula ao vivo", type: "class" },
                { date: new Date(Date.now() + 86400000), title: "Prazo", type: "deadline" },
                { date: new Date(2024, 11, 25), title: "Quiz", type: "exam" },
              ]}
            />
          </div>

          {/* Upcoming Events */}
          <div className="space-y-4">
            <h2 className="font-semibold text-foreground">Próximos Eventos</h2>
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const config = typeConfig[event.type];
                const Icon = config.icon;

                return (
                  <div
                    key={event.id}
                    className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border",
                          config.color
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {event.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{event.course}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{event.date}</span>
                          <span>•</span>
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
