import { BookOpen, Clock, Users, Star, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  students: number;
  rating: number;
  category: string;
  lastAccessed?: string;
}

interface CourseCardProps {
  course: Course;
  variant?: "default" | "compact" | "featured";
}

export function CourseCard({ course, variant = "default" }: CourseCardProps) {
  const progressPercentage = (course.completedLessons / course.totalLessons) * 100;

  if (variant === "compact") {
    return (
      <Link
        to={`/course/${course.id}`}
        className="flex gap-4 p-4 rounded-xl bg-card hover:shadow-lg transition-all duration-300 group border border-border/50"
      >
        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/10 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <Badge variant="secondary" className="mb-2 text-xs font-sans">
            {course.category}
          </Badge>
          <h3 className="font-serif font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 font-sans">{course.instructor}</p>
          <div className="mt-2">
            <Progress value={progressPercentage} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1 font-sans">
              {course.completedLessons}/{course.totalLessons} aulas
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        to={`/course/${course.id}`}
        className="relative overflow-hidden rounded-2xl bg-card group cursor-pointer"
      >
        <div className="relative h-64 overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-glow">
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Badge className="bg-accent text-accent-foreground mb-3 font-sans">{course.category}</Badge>
          <h3 className="text-xl font-serif font-bold text-primary-foreground mb-2">{course.title}</h3>
          <p className="text-primary-foreground/80 text-sm line-clamp-2 font-sans">{course.description}</p>
          <div className="flex items-center gap-4 mt-4 text-primary-foreground/70 text-sm font-sans">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {course.totalLessons} aulas
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              {course.rating}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/course/${course.id}`}
      className="block rounded-xl bg-card overflow-hidden hover:shadow-lg transition-all duration-300 group border border-border/50"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Badge className="absolute top-3 left-3 bg-card/90 text-card-foreground font-sans">
          {course.category}
        </Badge>
        {course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 font-sans">{course.instructor}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground font-sans">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {course.totalLessons}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            {course.rating}
          </span>
        </div>
        {course.progress > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm mb-2 font-sans">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium text-primary">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </div>
    </Link>
  );
}
