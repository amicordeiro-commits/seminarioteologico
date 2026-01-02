import { AppLayout } from "@/components/layout/AppLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { RecentBlogPosts } from "@/components/dashboard/RecentBlogPosts";
import { useUpcomingEvents } from "@/hooks/useCalendarEvents";
import { BookOpen, Clock, Trophy, TrendingUp, ArrowRight, Cross, BookMarked, Loader2, GraduationCap, FileText, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-theology.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useCourses, useEnrollments } from "@/hooks/useCourses";
import { useCertificates } from "@/hooks/useCertificates";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Aluno';
  
  const { data: courses, isLoading: loadingCourses } = useCourses();
  const { data: enrollments, isLoading: loadingEnrollments } = useEnrollments();
  const { data: upcomingEvents, isLoading: loadingEvents } = useUpcomingEvents(4);
  const { data: certificates, isLoading: loadingCertificates } = useCertificates();

  // Fetch real system stats
  const { data: systemStats } = useQuery({
    queryKey: ["system-stats"],
    queryFn: async () => {
      const [lessonsResult, quizzesResult, certificatesResult] = await Promise.all([
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase.from("quizzes").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("certificates").select("id", { count: "exact", head: true }),
      ]);

      return {
        totalLessons: lessonsResult.count || 0,
        totalQuizzes: quizzesResult.count || 0,
        totalCertificates: certificatesResult.count || 0,
      };
    },
  });

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
  const myEnrollmentsCount = enrollments?.length || 0;

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
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Welcome Hero */}
        <section 
          className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
          <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2 sm:mb-4">
                <Cross className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span className="text-accent text-xs sm:text-sm font-medium font-sans">Seminário Teológico</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-primary-foreground mb-2 sm:mb-4 animate-fade-in">
                Graça e paz, {userName}!
              </h1>
              <p className="text-primary-foreground/80 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 animate-fade-in font-sans" style={{ animationDelay: "100ms" }}>
                Continue sua jornada de formação teológica. Você tem <span className="text-accent font-semibold">{coursesWithProgress.length} cursos</span> disponíveis.
              </p>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <Button variant="accent" size="default" className="text-sm sm:text-base" asChild>
                  <Link to="/courses">
                    Explorar Cursos
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="default" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground text-sm sm:text-base">
                  <Link to="/devotional">
                    <BookMarked className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Devocional
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Blog Posts - Right after hero */}
        <RecentBlogPosts limit={4} />

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <StatsCard
            title="Cursos Disponíveis"
            value={coursesWithProgress.length}
            subtitle="Total no sistema"
            icon={BookOpen}
            variant="primary"
          />
          <StatsCard
            title="Total de Aulas"
            value={systemStats?.totalLessons || 0}
            subtitle="Conteúdos disponíveis"
            icon={FileText}
            variant="default"
          />
          <StatsCard
            title="Minhas Matrículas"
            value={myEnrollmentsCount}
            subtitle={`${completedCourses.length} concluído(s)`}
            icon={GraduationCap}
            variant="success"
          />
          <StatsCard
            title="Avaliações"
            value={systemStats?.totalQuizzes || 0}
            subtitle="Quizzes disponíveis"
            icon={Trophy}
            variant="accent"
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Courses in Progress */}
          <section className="lg:col-span-2 space-y-3 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg md:text-xl font-serif font-semibold text-foreground">Cursos Disponíveis</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/courses" className="text-primary font-sans text-xs sm:text-sm">
                  Ver todos
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Link>
              </Button>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
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
          <aside className="space-y-4 sm:space-y-6">
            {/* Calendar */}
            <CalendarWidget events={calendarEvents} />

            {/* Activities */}
            <div className="space-y-2 sm:space-y-4">
              <h3 className="font-serif font-semibold text-foreground text-sm sm:text-base">Próximas Atividades</h3>
              {loadingEvents ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary" />
                </div>
              ) : activities.length === 0 ? (
                <div className="p-4 sm:p-6 rounded-lg sm:rounded-xl bg-card border border-border text-center">
                  <p className="text-muted-foreground text-xs sm:text-sm">Nenhuma atividade agendada</p>
                </div>
              ) : (
                <ActivityTimeline activities={activities} />
              )}
            </div>
          </aside>
        </div>

        {/* Featured Course */}
        {coursesWithProgress.length > 4 && (
          <section className="space-y-3 sm:space-y-6">
            <h2 className="text-base sm:text-lg md:text-xl font-serif font-semibold text-foreground">Curso em Destaque</h2>
            <CourseCard course={coursesWithProgress[4]} variant="featured" />
          </section>
        )}

        {/* Certificates Section */}
        <section className="space-y-3 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg md:text-xl font-serif font-semibold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Meus Certificados
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/certificates" className="text-primary font-sans text-xs sm:text-sm">
                Ver todos
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          {loadingCertificates ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
            </div>
          ) : certificates && certificates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {certificates.slice(0, 3).map((cert, index) => (
                <div
                  key={cert.id}
                  className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-accent/10 via-card to-primary/5 border border-accent/20 hover:border-accent/40 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <Award className="w-6 h-6 text-accent" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {format(new Date(cert.issued_at), "MMM yyyy", { locale: ptBR })}
                    </Badge>
                  </div>
                  <h3 className="font-serif font-semibold text-foreground mb-1 line-clamp-2">
                    {(cert as any).courses?.title || "Curso Concluído"}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 font-sans">
                    Nº {cert.certificate_number}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {(cert as any).courses?.duration_hours || 0}h de carga horária
                    </span>
                    <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                      <Link to="/certificates">
                        <Award className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-xl bg-card border border-border text-center">
              <Award className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-serif font-semibold text-foreground mb-2">Nenhum certificado ainda</h3>
              <p className="text-sm text-muted-foreground mb-4 font-sans">
                Complete um curso para receber seu certificado de conclusão.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/courses">
                  Explorar Cursos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;