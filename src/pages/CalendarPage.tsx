import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, BookOpen, Video, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useCalendarEvents, useUpcomingEvents } from "@/hooks/useCalendarEvents";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  class: { icon: Video, color: "bg-accent/10 text-accent border-accent/30", label: "Aula" },
  deadline: { icon: Clock, color: "bg-destructive/10 text-destructive border-destructive/30", label: "Prazo" },
  quiz: { icon: FileText, color: "bg-primary/10 text-primary border-primary/30", label: "Quiz" },
  mentoring: { icon: BookOpen, color: "bg-green-500/10 text-green-500 border-green-500/30", label: "Mentoria" },
  event: { icon: BookOpen, color: "bg-secondary/50 text-secondary-foreground border-border", label: "Evento" },
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { data: events = [] } = useCalendarEvents(currentDate);
  const { data: upcomingEvents = [] } = useUpcomingEvents(10);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const navigateMonth = (direction: number) => {
    setCurrentDate(direction === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => 
      isSameDay(new Date(event.start_time), day)
    );
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <AppLayout>
      <div className="space-y-8 p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Calendário</h1>
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
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-semibold text-foreground capitalize">
                {format(currentDate, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the month starts */}
              {Array.from({ length: startDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}
              
              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasEvents = dayEvents.length > 0;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all",
                      isToday && "bg-primary text-primary-foreground",
                      isSelected && !isToday && "bg-primary/10 border-2 border-primary",
                      !isToday && !isSelected && "hover:bg-muted",
                      !isSameMonth(day, currentDate) && "text-muted-foreground/50"
                    )}
                  >
                    <span className={cn("text-sm font-medium", isToday && "font-bold")}>
                      {format(day, "d")}
                    </span>
                    {hasEvents && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              typeConfig[event.event_type]?.color?.split(" ")[0] || "bg-primary"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Day Events */}
            {selectedDate && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-medium text-foreground mb-4">
                  Eventos em {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                </h3>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum evento neste dia.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayEvents.map((event) => {
                      const config = typeConfig[event.event_type] || typeConfig.event;
                      const Icon = config.icon;
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", config.color)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(event.start_time), "HH:mm", { locale: ptBR })}
                              {event.end_time && ` - ${format(new Date(event.end_time), "HH:mm", { locale: ptBR })}`}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="space-y-4">
            <h2 className="font-serif font-semibold text-foreground">Próximos Eventos</h2>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum evento próximo</p>
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const config = typeConfig[event.event_type] || typeConfig.event;
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
                          {event.description && (
                            <p className="text-sm text-muted-foreground truncate">{event.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {format(new Date(event.start_time), "d MMM", { locale: ptBR })}
                            </span>
                            <span>•</span>
                            <span>{format(new Date(event.start_time), "HH:mm", { locale: ptBR })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
