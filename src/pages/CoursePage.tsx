import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Play,
  Clock,
  BookOpen,
  Star,
  CheckCircle2,
  PlayCircle,
  ArrowLeft,
  Download,
  Share2,
  Cross,
  BookMarked,
  Loader2,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCourse, useEnrollment, useEnrollInCourse, useLessonProgress, useMarkLessonComplete } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";

const CoursePage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  
  const { data: course, isLoading: loadingCourse } = useCourse(id || '');
  const { data: enrollment, isLoading: loadingEnrollment } = useEnrollment(id || '');
  const { data: lessonProgress } = useLessonProgress(id || '');
  const enrollMutation = useEnrollInCourse();
  const markCompleteMutation = useMarkLessonComplete();

  const handleEnroll = async () => {
    if (!id) return;
    try {
      await enrollMutation.mutateAsync(id);
      toast({
        title: "Matrícula realizada!",
        description: "Você foi matriculado no curso com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível realizar a matrícula.",
        variant: "destructive",
      });
    }
  };

  const handleMarkComplete = async (lessonId: string) => {
    if (!id) return;
    try {
      await markCompleteMutation.mutateAsync({ lessonId, courseId: id });
      toast({
        title: "Aula concluída!",
        description: "Seu progresso foi salvo.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a aula como concluída.",
        variant: "destructive",
      });
    }
  };

  if (loadingCourse || loadingEnrollment) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-serif font-semibold text-foreground">Curso não encontrado</h2>
          <Button asChild className="mt-4">
            <Link to="/courses">Voltar aos cursos</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const completedLessonsCount = lessonProgress?.filter(p => p.completed).length || 0;
  const totalLessons = course.lessons?.length || course.total_lessons || 1;
  const progressPercentage = enrollment ? (completedLessonsCount / totalLessons) * 100 : 0;

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
                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800'}
                alt={course.title}
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Cross className="w-4 h-4 text-accent" />
                  <Badge className="bg-accent text-accent-foreground font-sans">{course.category}</Badge>
                  <Badge variant="secondary" className="font-sans capitalize">{course.level}</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground mb-2">
                  {course.title}
                </h1>
                <p className="text-primary-foreground/80 font-sans">{course.instructor}</p>
              </div>
              {enrollment && (
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-glow hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-primary-foreground ml-1" />
                </button>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed font-sans">{course.description}</p>

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-serif font-semibold text-foreground">{course.duration_hours}h</p>
                <p className="text-sm text-muted-foreground font-sans">Duração</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-serif font-semibold text-foreground">{totalLessons}</p>
                <p className="text-sm text-muted-foreground font-sans">Aulas</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Star className="w-6 h-6 fill-warning text-warning mx-auto mb-2" />
                <p className="font-serif font-semibold text-foreground">4.8</p>
                <p className="text-sm text-muted-foreground font-sans">Avaliação</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                <p className="font-serif font-semibold text-foreground">{completedLessonsCount}</p>
                <p className="text-sm text-muted-foreground font-sans">Concluídas</p>
              </div>
            </div>

            {/* Lessons */}
            {course.lessons && course.lessons.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-semibold text-foreground">Conteúdo Programático</h2>
                <Accordion type="single" collapsible defaultValue="lessons" className="space-y-3">
                  <AccordionItem
                    value="lessons"
                    className="border border-border rounded-xl overflow-hidden bg-card"
                  >
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-secondary/50">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-serif font-semibold">
                          1
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-serif font-medium text-foreground">Módulo Principal</h3>
                          <p className="text-sm text-muted-foreground font-sans">
                            {completedLessonsCount}/{course.lessons.length} aulas • {course.duration_hours}h
                          </p>
                        </div>
                        {completedLessonsCount === course.lessons.length && (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4">
                      <div className="space-y-2 pt-2 border-t border-border">
                        {course.lessons.map((lesson) => {
                          const isCompleted = lessonProgress?.some(p => p.lesson_id === lesson.id && p.completed);
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => enrollment && !isCompleted && handleMarkComplete(lesson.id)}
                              disabled={!enrollment || isCompleted || markCompleteMutation.isPending}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left group font-sans",
                                isCompleted
                                  ? "bg-success/10"
                                  : enrollment
                                  ? "hover:bg-secondary cursor-pointer"
                                  : "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                  isCompleted
                                    ? "bg-success text-success-foreground"
                                    : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                )}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <PlayCircle className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={cn(
                                    "text-sm font-medium",
                                    isCompleted
                                      ? "text-muted-foreground line-through"
                                      : "text-foreground"
                                  )}
                                >
                                  {lesson.title}
                                </p>
                                {lesson.description && (
                                  <p className="text-xs text-muted-foreground">{lesson.description}</p>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {lesson.duration_minutes}min
                              </span>
                              {lesson.is_free && (
                                <Badge variant="secondary" className="text-xs">
                                  Grátis
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Progress Card */}
            <div className="p-6 rounded-xl bg-card border border-border sticky top-24">
              <h3 className="font-serif font-semibold text-foreground mb-4">
                {enrollment ? 'Seu Progresso' : 'Matricule-se'}
              </h3>
              
              {enrollment ? (
                <>
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
                        <span className="text-3xl font-serif font-bold text-foreground">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground font-sans">
                      {completedLessonsCount} de {totalLessons} aulas concluídas
                    </p>
                  </div>

                  <Button variant="hero" size="lg" className="w-full mb-3">
                    <Play className="w-5 h-5 mr-2" />
                    Continuar Curso
                  </Button>
                </>
              ) : (
                <div className="text-center mb-6">
                  <p className="text-muted-foreground font-sans mb-4">
                    Matricule-se para ter acesso ao conteúdo completo do curso.
                  </p>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-5 h-5 mr-2" />
                    )}
                    Matricular-se Agora
                  </Button>
                </div>
              )}

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
                <h4 className="text-sm font-medium text-muted-foreground mb-3 font-sans">Instrutor</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-serif font-semibold">
                      {course.instructor?.split(" ").map((n) => n[0]).join("").slice(0, 2) || 'IN'}
                    </span>
                  </div>
                  <div>
                    <p className="font-serif font-medium text-foreground">{course.instructor || 'Instrutor'}</p>
                    <p className="text-sm text-muted-foreground font-sans">Especialista em {course.category}</p>
                  </div>
                </div>
              </div>

              {/* Scripture Reference */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <BookMarked className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent font-sans">Versículo Base</span>
                </div>
                <p className="text-sm text-muted-foreground italic font-sans leading-relaxed">
                  "Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade."
                </p>
                <p className="text-xs text-muted-foreground/70 mt-2 font-sans">2 Timóteo 2:15</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
};

export default CoursePage;
