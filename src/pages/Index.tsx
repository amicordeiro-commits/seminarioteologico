import { AppLayout } from "@/components/layout/AppLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { mockCourses, mockActivities } from "@/data/mockData";
import { BookOpen, Clock, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const coursesInProgress = mockCourses.filter((c) => c.progress > 0 && c.progress < 100);
  const completedCourses = mockCourses.filter((c) => c.progress === 100);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Hero */}
        <section 
          className="relative rounded-2xl overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
          <div className="relative p-8 md:p-12">
            <div className="max-w-xl">
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 animate-fade-in">
                Olá, João! 👋
              </h1>
              <p className="text-primary-foreground/80 text-lg mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
                Continue de onde parou. Você tem <span className="text-accent font-semibold">3 atividades</span> pendentes esta semana.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <Button variant="accent" size="lg" asChild>
                  <Link to={`/course/${coursesInProgress[0]?.id}`}>
                    Continuar Aprendendo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/courses">
                    Ver Todos os Cursos
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
            title="Horas de Estudo"
            value="42h"
            subtitle="Este mês"
            icon={Clock}
            trend={{ value: 12, isPositive: true }}
            variant="default"
          />
          <StatsCard
            title="Cursos Concluídos"
            value={completedCourses.length}
            subtitle="Total"
            icon={Trophy}
            variant="success"
          />
          <StatsCard
            title="Sequência de Dias"
            value="7 dias"
            subtitle="Continue assim!"
            icon={TrendingUp}
            variant="accent"
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses in Progress */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Continuar Estudando</h2>
              <Button variant="ghost" asChild>
                <Link to="/courses" className="text-primary">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coursesInProgress.slice(0, 4).map((course, index) => (
                <div
                  key={course.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Calendar */}
            <CalendarWidget
              events={[
                { date: new Date(2024, 11, 25), title: "Aula ao vivo", type: "class" },
                { date: new Date(2024, 11, 28), title: "Prazo", type: "deadline" },
              ]}
            />

            {/* Activities */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Próximas Atividades</h3>
              <ActivityTimeline activities={mockActivities.slice(0, 4)} />
            </div>
          </aside>
        </div>

        {/* Featured Course */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Curso em Destaque</h2>
          <CourseCard course={mockCourses[4]} variant="featured" />
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;
