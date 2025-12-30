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
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cross className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-xs sm:text-sm text-primary font-medium font-sans">Biblioteca Teológica</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground">Meus Cursos</h1>
            <p className="text-sm text-muted-foreground font-sans">Gerencie seus cursos e continue sua formação</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 px-3">
              <Filter className="w-4 h-4 mr-2 sm:mr-0" />
              <span className="sm:hidden">Filtrar</span>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-serif font-bold text-foreground">{inProgressCourses.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans">Andamento</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-success/5 border border-success/20">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-success/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-success" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-serif font-bold text-foreground">{completedCourses.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans">Concluídos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-secondary border border-border">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-muted flex items-center justify-center">
              <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-serif font-bold text-foreground">{notStartedCourses.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans">Não iniciados</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "transition-all duration-200 font-sans text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3",
                selectedCategory === category && "shadow-md"
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
          <div className="text-center py-8 sm:py-12">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-serif font-medium text-foreground mb-2">Nenhum curso encontrado</h3>
            <p className="text-sm text-muted-foreground font-sans">Tente ajustar seus filtros de busca</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CoursesPage;
