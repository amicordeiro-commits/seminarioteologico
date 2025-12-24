import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Plus, Pencil, Trash2, Loader2, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string | null;
  instructor: string | null;
  duration_hours: number | null;
  total_lessons: number | null;
  is_published: boolean | null;
  thumbnail_url: string | null;
}

const defaultCourse: Partial<Course> = {
  title: "",
  description: "",
  category: "Teologia",
  level: "iniciante",
  instructor: "",
  duration_hours: 10,
  total_lessons: 0,
  is_published: false,
};

export default function AdminCoursesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

  // Fetch courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
  });

  // Fetch enrollments count
  const { data: enrollmentCounts = {} } = useQuery({
    queryKey: ["admin-enrollment-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("course_id");

      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((e) => {
        counts[e.course_id] = (counts[e.course_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (course: Partial<Course>) => {
      if (course.id) {
        const { error } = await supabase
          .from("courses")
          .update({
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            instructor: course.instructor,
            duration_hours: course.duration_hours,
            total_lessons: course.total_lessons,
            is_published: course.is_published,
            thumbnail_url: course.thumbnail_url,
          })
          .eq("id", course.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert({
          title: course.title!,
          description: course.description,
          category: course.category!,
          level: course.level,
          instructor: course.instructor,
          duration_hours: course.duration_hours,
          total_lessons: course.total_lessons,
          is_published: course.is_published,
          thumbnail_url: course.thumbnail_url,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Curso salvo com sucesso!" });
      setIsDialogOpen(false);
      setEditingCourse(null);
    },
    onError: () => {
      toast({ title: "Erro ao salvar curso", variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Curso excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir curso", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!editingCourse?.title || !editingCourse?.category) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    saveMutation.mutate(editingCourse);
  };

  const openNewCourse = () => {
    setEditingCourse(defaultCourse);
    setIsDialogOpen(true);
  };

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              Gerenciar Cursos
            </h1>
            <p className="text-muted-foreground mt-1">
              {courses.length} cursos cadastrados
            </p>
          </div>
          <Button onClick={openNewCourse} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Curso
          </Button>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {course.instructor}
                      </p>
                    </div>
                    <Badge variant={course.is_published ? "default" : "secondary"}>
                      {course.is_published ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{course.category}</span>
                    <span>•</span>
                    <span>{course.duration_hours}h</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {enrollmentCounts[course.id] || 0}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditCourse(course)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(course.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCourse?.id ? "Editar Curso" : "Novo Curso"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={editingCourse?.title || ""}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instrutor</Label>
                  <Input
                    value={editingCourse?.instructor || ""}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, instructor: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingCourse?.description || ""}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select
                    value={editingCourse?.category || "Teologia"}
                    onValueChange={(value) =>
                      setEditingCourse({ ...editingCourse, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teologia">Teologia</SelectItem>
                      <SelectItem value="Novo Testamento">Novo Testamento</SelectItem>
                      <SelectItem value="Antigo Testamento">Antigo Testamento</SelectItem>
                      <SelectItem value="Línguas Bíblicas">Línguas Bíblicas</SelectItem>
                      <SelectItem value="História">História</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nível</Label>
                  <Select
                    value={editingCourse?.level || "iniciante"}
                    onValueChange={(value) =>
                      setEditingCourse({ ...editingCourse, level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediário">Intermediário</SelectItem>
                      <SelectItem value="avançado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duração (horas)</Label>
                  <Input
                    type="number"
                    value={editingCourse?.duration_hours || 0}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        duration_hours: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingCourse?.is_published || false}
                  onCheckedChange={(checked) =>
                    setEditingCourse({ ...editingCourse, is_published: checked })
                  }
                />
                <Label>Publicado</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
