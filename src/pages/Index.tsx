import { AppLayout } from "@/components/layout/AppLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { mockCourses, mockActivities } from "@/data/mockData";
import { BookOpen, Clock, Trophy, TrendingUp, ArrowRight, Cross, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-theology.jpg";

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
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
          <div className="relative p-8 md:p-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <Cross className="w-5 h-5 text-accent" />
                <span className="text-accent text-sm font-medium font-sans">Seminário Teológico</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4 animate-fade-in">
                Graça e paz, Samuel!
              </h1>
              <p className="text-primary-foreground/80 text-lg mb-6 animate-fade-in font-sans" style={{ animationDelay: "100ms" }}>
                Continue sua jornada de formação teológica. Você tem <span className="text-accent font-semibold">3 atividades</span> pendentes esta semana.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <Button variant="accent" size="lg" asChild>
                  <Link to={`/course/${coursesInProgress[0]?.id}`}>
                    Continuar Estudando
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/courses">
                    <BookMarked className="w-5 h-5 mr-2" />
                    Biblioteca de Cursos
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
            subtitle="Certificados obtidos"
            icon={Trophy}
            variant="success"
          />
          <StatsCard
            title="Devocionais"
            value="7 dias"
            subtitle="Sequência de leitura"
            icon={TrendingUp}
            variant="accent"
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses in Progress */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-foreground">Continue sua Formação</h2>
              <Button variant="ghost" asChild>
                <Link to="/courses" className="text-primary font-sans">
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
                { date: new Date(2024, 11, 25), title: "Culto de Natal", type: "class" },
                { date: new Date(2024, 11, 28), title: "Entrega de Ensaio", type: "deadline" },
                { date: new Date(2024, 11, 31), title: "Vigília de Ano Novo", type: "class" },
              ]}
            />

            {/* Activities */}
            <div className="space-y-4">
              <h3 className="font-serif font-semibold text-foreground">Próximas Atividades</h3>
              <ActivityTimeline activities={mockActivities.slice(0, 4)} />
            </div>
          </aside>
        </div>

        {/* Featured Course */}
        <section className="space-y-6">
          <h2 className="text-xl font-serif font-semibold text-foreground">Curso em Destaque</h2>
          <CourseCard course={mockCourses[4]} variant="featured" />
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;
