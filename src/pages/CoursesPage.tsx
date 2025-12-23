import { AppLayout } from "@/components/layout/AppLayout";
import { CourseCard } from "@/components/courses/CourseCard";
import { mockCourses } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen, Trophy, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = ["Todos", "Desenvolvimento", "Data Science", "Design", "Marketing", "IA", "Gestão"];

const CoursesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = mockCourses.filter((course) => {
    const matchesCategory = selectedCategory === "Todos" || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const inProgressCourses = filteredCourses.filter(c => c.progress > 0 && c.progress < 100);
  const completedCourses = filteredCourses.filter(c => c.progress === 100);
  const notStartedCourses = filteredCourses.filter(c => c.progress === 0);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus Cursos</h1>
            <p className="text-muted-foreground">Gerencie seus cursos e continue aprendendo</p>
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
              <p className="text-2xl font-bold text-foreground">{inProgressCourses.length}</p>
              <p className="text-sm text-muted-foreground">Em andamento</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/20">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedCourses.length}</p>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary border border-border">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{notStartedCourses.length}</p>
              <p className="text-sm text-muted-foreground">Não iniciados</p>
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
                "transition-all duration-200",
                selectedCategory === category && "shadow-md"
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
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
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar seus filtros de busca</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CoursesPage;
