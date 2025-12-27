import { AppLayout } from "@/components/layout/AppLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen, Trophy, Clock, Cross, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCourses, useEnrollments } from "@/hooks/useCourses";

const categories = ["Todos", "Teologia", "Estudos Bíblicos", "Idiomas Bíblicos", "História", "Ministério"];

const CoursesPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  
  // Update search when URL param changes
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const { data: courses, isLoading: loadingCourses } = useCourses();
  const { data: enrollments, isLoading: loadingEnrollments } = useEnrollments();

  // Map courses with enrollment data
  const coursesWithProgress = courses?.map(course => {
    const enrollment = enrollments?.find(e => e.course_id === course.id);
    return {
      id: course.id,
      title: course.title,
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

  const filteredCourses = coursesWithProgress.filter((course) => {
    const matchesCategory = selectedCategory === "Todos" || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const inProgressCourses = filteredCourses.filter(c => c.progress > 0 && c.progress < 100);
  const completedCourses = filteredCourses.filter(c => c.progress === 100);
  const notStartedCourses = filteredCourses.filter(c => c.progress === 0);

  const isLoading = loadingCourses || loadingEnrollments;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cross className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium font-sans">Biblioteca Teológica</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Meus Cursos</h1>
            <p className="text-muted-foreground font-sans">Gerencie seus cursos e continue sua formação</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-foreground">{inProgressCourses.length}</p>
              <p className="text-sm text-muted-foreground font-sans">Em andamento</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/20">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-foreground">{completedCourses.length}</p>
              <p className="text-sm text-muted-foreground font-sans">Concluídos</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary border border-border">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-foreground">{notStartedCourses.length}</p>
              <p className="text-sm text-muted-foreground font-sans">Não iniciados</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "transition-all duration-200 font-sans",
                selectedCategory === category && "shadow-md"
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <div
                key={course.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-medium text-foreground mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground font-sans">Tente ajustar seus filtros de busca</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CoursesPage;
