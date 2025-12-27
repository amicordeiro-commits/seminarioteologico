import { AppLayout } from "@/components/layout/AppLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { useUpcomingEvents } from "@/hooks/useCalendarEvents";
import { BookOpen, Clock, Trophy, TrendingUp, ArrowRight, Cross, BookMarked, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-theology.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useCourses, useEnrollments } from "@/hooks/useCourses";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Aluno';
  
  const { data: courses, isLoading: loadingCourses } = useCourses();
  const { data: enrollments, isLoading: loadingEnrollments } = useEnrollments();
  const { data: upcomingEvents, isLoading: loadingEvents } = useUpcomingEvents(4);

  // Map courses with enrollment data
  const coursesWithProgress = courses?.map(course => {
    const enrollment = enrollments?.find(e => e.course_id === course.id);
    return {
      id: course.id,
      title: course.title,
      description: course.description || '',
      instructor: course.instructor || 'Instrutor',
      thumbnail: course.thumbnail_url || 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
      progress: enrollment?.progress_percent || 0,
      totalLessons: course.total_lessons,
      completedLessons: Math.round((course.total_lessons * (enrollment?.progress_percent || 0)) / 100),
      duration: `${course.duration_hours}h`,
      category: course.category,
      rating: 4.8,
      level: course.level,
    };
  }) || [];

  const coursesInProgress = coursesWithProgress.filter((c) => c.progress > 0 && c.progress < 100);
  const completedCourses = coursesWithProgress.filter((c) => c.progress === 100);

  // Map events to activities format
  const activities = upcomingEvents?.map(event => {
    let eventType: "assignment" | "quiz" | "lesson" | "deadline" = "lesson";
    if (event.event_type === "deadline") eventType = "deadline";
    if (event.event_type === "quiz") eventType = "quiz";
    if (event.event_type === "assignment") eventType = "assignment";
    return {
      id: event.id,
      title: event.title,
      course: event.description || "Evento",
      type: eventType,
      dueDate: format(new Date(event.start_time), "d 'de' MMMM", { locale: ptBR }),
    };
  }) || [];

  // Map events for calendar widget
  const calendarEvents = upcomingEvents?.map(event => ({
    date: new Date(event.start_time),
    title: event.title,
    type: (event.event_type === "class" ? "class" : event.event_type === "deadline" ? "deadline" : "exam") as "class" | "deadline" | "exam",
  })) || [];
  
  const isLoading = loadingCourses || loadingEnrollments;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Hero */}
        <section 
          className="relative rounded-2xl overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
          <div className="relative p-8 md:p-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <Cross className="w-5 h-5 text-accent" />
                <span className="text-accent text-sm font-medium font-sans">Seminário Teológico</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4 animate-fade-in">
                Graça e paz, {userName}!
              </h1>
              <p className="text-primary-foreground/80 text-lg mb-6 animate-fade-in font-sans" style={{ animationDelay: "100ms" }}>
                Continue sua jornada de formação teológica. Você tem <span className="text-accent font-semibold">{coursesWithProgress.length} cursos</span> disponíveis.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <Button variant="accent" size="lg" asChild>
                  <Link to="/courses">
                    Explorar Cursos
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/devotional">
                    <BookMarked className="w-5 h-5 mr-2" />
                    Devocional do Dia
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Cursos Ativos"
            value={coursesInProgress.length}
            subtitle="Em andamento"
            icon={BookOpen}
            variant="primary"
          />
          <StatsCard
            title="Cursos Disponíveis"
            value={coursesWithProgress.length}
            subtitle="Total de cursos"
            icon={Clock}
            variant="default"
          />
          <StatsCard
            title="Cursos Concluídos"
            value={completedCourses.length}
            subtitle="Certificados obtidos"
            icon={Trophy}
            variant="success"
          />
          <StatsCard
            title="Próximos Eventos"
            value={upcomingEvents?.length || 0}
            subtitle="Atividades agendadas"
            icon={TrendingUp}
            variant="accent"
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses in Progress */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-foreground">Cursos Disponíveis</h2>
              <Button variant="ghost" asChild>
                <Link to="/courses" className="text-primary font-sans">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coursesWithProgress.slice(0, 4).map((course, index) => (
                  <div
                    key={course.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Calendar */}
            <CalendarWidget events={calendarEvents} />

            {/* Activities */}
            <div className="space-y-4">
              <h3 className="font-serif font-semibold text-foreground">Próximas Atividades</h3>
              {loadingEvents ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : activities.length === 0 ? (
                <div className="p-6 rounded-xl bg-card border border-border text-center">
                  <p className="text-muted-foreground text-sm">Nenhuma atividade agendada</p>
                </div>
              ) : (
                <ActivityTimeline activities={activities} />
              )}
            </div>
          </aside>
        </div>

        {/* Featured Course */}
        {coursesWithProgress.length > 4 && (
          <section className="space-y-6">
            <h2 className="text-xl font-serif font-semibold text-foreground">Curso em Destaque</h2>
            <CourseCard course={coursesWithProgress[4]} variant="featured" />
          </section>
        )}
      </div>
    </AppLayout>
  );
};

export default Index;