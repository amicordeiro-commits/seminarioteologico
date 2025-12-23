import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockCourses, mockModules, mockLessons } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Play,
  Clock,
  BookOpen,
  Users,
  Star,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  ArrowLeft,
  Download,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const lessonTypeIcons = {
  video: PlayCircle,
  exercise: FileText,
  quiz: HelpCircle,
};

const CoursePage = () => {
  const { id } = useParams();
  const course = mockCourses.find((c) => c.id === id) || mockCourses[0];
  const progressPercentage = (course.completedLessons / course.totalLessons) * 100;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/courses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos cursos
          </Link>
        </Button>

        {/* Course Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <Badge className="bg-accent text-accent-foreground mb-3">{course.category}</Badge>
                <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                  {course.title}
                </h1>
                <p className="text-primary-foreground/80">{course.instructor}</p>
              </div>
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-glow hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-primary-foreground ml-1" />
              </button>
            </div>

            <p className="text-muted-foreground leading-relaxed">{course.description}</p>

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-semibold text-foreground">{course.duration}</p>
                <p className="text-sm text-muted-foreground">Duração</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-semibold text-foreground">{course.totalLessons}</p>
                <p className="text-sm text-muted-foreground">Aulas</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-semibold text-foreground">{course.students.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Alunos</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Star className="w-6 h-6 fill-warning text-warning mx-auto mb-2" />
                <p className="font-semibold text-foreground">{course.rating}</p>
                <p className="text-sm text-muted-foreground">Avaliação</p>
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Conteúdo do Curso</h2>
              <Accordion type="single" collapsible className="space-y-3">
                {mockModules.map((module, moduleIndex) => (
                  <AccordionItem
                    key={module.id}
                    value={module.id}
                    className="border border-border rounded-xl overflow-hidden bg-card"
                  >
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-secondary/50">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold">
                          {moduleIndex + 1}
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-medium text-foreground">{module.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {module.completedLessons}/{module.lessons} aulas • {module.duration}
                          </p>
                        </div>
                        {module.completedLessons === module.lessons && (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4">
                      <div className="space-y-2 pt-2 border-t border-border">
                        {mockLessons.map((lesson) => {
                          const Icon = lessonTypeIcons[lesson.type];
                          return (
                            <button
                              key={lesson.id}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left group",
                                lesson.current
                                  ? "bg-primary/10 border border-primary/30"
                                  : "hover:bg-secondary"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                  lesson.completed
                                    ? "bg-success text-success-foreground"
                                    : lesson.current
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                )}
                              >
                                {lesson.completed ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <Icon className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={cn(
                                    "text-sm font-medium",
                                    lesson.completed
                                      ? "text-muted-foreground"
                                      : "text-foreground"
                                  )}
                                >
                                  {lesson.title}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {lesson.duration}
                              </span>
                              {lesson.current && (
                                <Badge variant="secondary" className="text-xs">
                                  Atual
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Progress Card */}
            <div className="p-6 rounded-xl bg-card border border-border sticky top-24">
              <h3 className="font-semibold text-foreground mb-4">Seu Progresso</h3>
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="12"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="12"
                      strokeDasharray={`${progressPercentage * 3.52} 352`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {course.completedLessons} de {course.totalLessons} aulas concluídas
                </p>
              </div>

              <Button variant="hero" size="lg" className="w-full mb-3">
                <Play className="w-5 h-5 mr-2" />
                Continuar Curso
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="w-4 h-4 mr-1" />
                  Materiais
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-1" />
                  Compartilhar
                </Button>
              </div>

              {/* Instructor */}
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Instrutor</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {course.instructor.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{course.instructor}</p>
                    <p className="text-sm text-muted-foreground">Especialista em {course.category}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
};

export default CoursePage;
