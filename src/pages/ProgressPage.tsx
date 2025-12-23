import { AppLayout } from "@/components/layout/AppLayout";
import { Progress } from "@/components/ui/progress";
import { mockCourses } from "@/data/mockData";
import { Trophy, Target, Clock, TrendingUp, BookOpen, Award, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const weeklyData = [
  { day: "Seg", hours: 2.5 },
  { day: "Ter", hours: 1.8 },
  { day: "Qua", hours: 3.2 },
  { day: "Qui", hours: 2.0 },
  { day: "Sex", hours: 1.5 },
  { day: "Sáb", hours: 4.0 },
  { day: "Dom", hours: 0.5 },
];

const achievements = [
  { id: "1", title: "Primeiro Passo", description: "Complete sua primeira aula", icon: BookOpen, unlocked: true },
  { id: "2", title: "Dedicado", description: "Estude por 7 dias seguidos", icon: Flame, unlocked: true },
  { id: "3", title: "Explorador", description: "Inscreva-se em 5 cursos", icon: Target, unlocked: true },
  { id: "4", title: "Mestre", description: "Complete 3 cursos", icon: Trophy, unlocked: false },
  { id: "5", title: "Maratonista", description: "Estude por 10 horas em uma semana", icon: Clock, unlocked: false },
  { id: "6", title: "Perfeccionista", description: "Obtenha 100% em um quiz", icon: Award, unlocked: true },
];

const ProgressPage = () => {
  const maxHours = Math.max(...weeklyData.map((d) => d.hours));
  const totalHoursWeek = weeklyData.reduce((acc, d) => acc + d.hours, 0);

  const coursesInProgress = mockCourses.filter((c) => c.progress > 0 && c.progress < 100);
  const completedCourses = mockCourses.filter((c) => c.progress === 100);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meu Progresso</h1>
          <p className="text-muted-foreground">Acompanhe sua evolução e conquistas</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                +12%
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalHoursWeek.toFixed(1)}h</p>
            <p className="text-sm text-muted-foreground">Esta semana</p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <Clock className="w-8 h-8 text-muted-foreground mb-4" />
            <p className="text-3xl font-bold text-foreground">42h</p>
            <p className="text-sm text-muted-foreground">Total estudado</p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <Trophy className="w-8 h-8 text-warning mb-4" />
            <p className="text-3xl font-bold text-foreground">{completedCourses.length}</p>
            <p className="text-sm text-muted-foreground">Cursos concluídos</p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <Flame className="w-8 h-8 text-accent mb-4" />
            <p className="text-3xl font-bold text-foreground">7 dias</p>
            <p className="text-sm text-muted-foreground">Sequência atual</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Activity Chart */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-card border border-border">
            <h2 className="font-semibold text-foreground mb-6">Atividade Semanal</h2>
            <div className="flex items-end justify-between gap-3 h-48">
              {weeklyData.map((data, index) => (
                <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-full rounded-t-lg transition-all duration-500 hover:opacity-80",
                      index === new Date().getDay() - 1 ? "bg-primary" : "bg-primary/30"
                    )}
                    style={{
                      height: `${(data.hours / maxHours) * 100}%`,
                      minHeight: "8px",
                      animationDelay: `${index * 100}ms`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{data.day}</span>
                  <span className="text-xs font-medium text-foreground">{data.hours}h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="font-semibold text-foreground mb-4">Conquistas</h2>
            <div className="space-y-3">
              {achievements.slice(0, 5).map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all",
                      achievement.unlocked
                        ? "bg-primary/5 border border-primary/20"
                        : "bg-muted/50 opacity-60"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        achievement.unlocked
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {achievement.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && (
                      <Trophy className="w-4 h-4 text-warning" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Course Progress */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Progresso por Curso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coursesInProgress.map((course) => {
              const percentage = (course.completedLessons / course.totalLessons) * 100;
              return (
                <div
                  key={course.id}
                  className="p-5 rounded-xl bg-card border border-border hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">{course.instructor}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            {course.completedLessons}/{course.totalLessons} aulas
                          </span>
                          <span className="font-medium text-primary">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProgressPage;
