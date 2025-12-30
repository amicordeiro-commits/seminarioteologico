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
import { PlayCircle, Plus, Pencil, Trash2, Loader2, Video, Upload, FileText, FolderOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free: boolean | null;
}

interface Course {
  id: string;
  title: string;
}

interface BatchLesson {
  title: string;
  content: string;
  description?: string;
  duration_minutes?: number;
}

const defaultLesson: Partial<Lesson> = {
  title: "",
  description: "",
  content: "",
  video_url: "",
  duration_minutes: 15,
  is_free: false,
};

export default function AdminLessonsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [batchText, setBatchText] = useState("");
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-courses-for-lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data as Course[];
    },
  });

  // Fetch lessons for selected course
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ["admin-lessons", selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return [];
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", selectedCourseId)
        .order("order_index");
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!selectedCourseId,
  });

  // Save lesson mutation
  const saveLessonMutation = useMutation({
    mutationFn: async (lesson: Partial<Lesson>) => {
      if (lesson.id) {
        const { error } = await supabase
          .from("lessons")
          .update({
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            video_url: lesson.video_url,
            duration_minutes: lesson.duration_minutes,
            is_free: lesson.is_free,
          })
          .eq("id", lesson.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("lessons").insert({
          course_id: selectedCourseId!,
          title: lesson.title!,
          description: lesson.description,
          content: lesson.content,
          video_url: lesson.video_url,
          duration_minutes: lesson.duration_minutes,
          order_index: lessons.length,
          is_free: lesson.is_free,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      toast({ title: "Aula salva com sucesso!" });
      setIsDialogOpen(false);
      setEditingLesson(null);
    },
    onError: () => {
      toast({ title: "Erro ao salvar aula", variant: "destructive" });
    },
  });

  // Delete lesson mutation
  const deleteLessonMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      toast({ title: "Aula excluída!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir aula", variant: "destructive" });
    },
  });

  // Batch import mutation
  const batchImportMutation = useMutation({
    mutationFn: async (lessons: BatchLesson[]) => {
      if (!selectedCourseId) throw new Error("Nenhum curso selecionado");
      
      const currentLessonsCount = lessons.length;
      const lessonsToInsert = lessons.map((lesson, idx) => ({
        course_id: selectedCourseId,
        title: lesson.title,
        content: lesson.content,
        description: lesson.description || null,
        duration_minutes: lesson.duration_minutes || 15,
        order_index: (currentLessonsCount) + idx,
        is_free: false,
      }));

      const { error } = await supabase.from("lessons").insert(lessonsToInsert);
      if (error) throw error;
      return lessonsToInsert.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      toast({ title: `${count} aulas importadas com sucesso!` });
      setIsBatchDialogOpen(false);
      setBatchText("");
    },
    onError: (error) => {
      toast({ title: "Erro ao importar aulas", description: String(error), variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!editingLesson?.title) {
      toast({ title: "Preencha o título", variant: "destructive" });
      return;
    }
    saveLessonMutation.mutate(editingLesson);
  };

  // Parse batch text - format: each lesson separated by "---" or "===" 
  // Each lesson: first line is title, rest is content
  const parseBatchText = (text: string): BatchLesson[] => {
    const blocks = text.split(/\n(?:---+|===+)\n/).filter(block => block.trim());
    
    return blocks.map(block => {
      const lines = block.trim().split('\n');
      const title = lines[0]?.replace(/^#+\s*/, '').trim() || 'Sem título';
      const content = lines.slice(1).join('\n').trim();
      
      return {
        title,
        content,
        duration_minutes: 15,
      };
    }).filter(lesson => lesson.title && lesson.content);
  };

  const handleBatchImport = () => {
    if (!batchText.trim()) {
      toast({ title: "Cole o texto das aulas", variant: "destructive" });
      return;
    }
    
    const parsedLessons = parseBatchText(batchText);
    
    if (parsedLessons.length === 0) {
      toast({ 
        title: "Nenhuma aula encontrada", 
        description: "Separe as aulas com --- ou === entre elas",
        variant: "destructive" 
      });
      return;
    }
    
    batchImportMutation.mutate(parsedLessons);
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <PlayCircle className="w-8 h-8 text-primary" />
              Gerenciar Aulas
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize as aulas de cada curso
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Courses List */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Cursos</h2>
            {coursesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedCourseId === course.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-card hover:bg-muted border"
                    }`}
                  >
                    <span className="font-medium text-sm">{course.title}</span>
                  </button>
                ))}
                {courses.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum curso cadastrado
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Lessons List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                {selectedCourseId ? "Aulas do Curso" : "Selecione um Curso"}
              </h2>
              {selectedCourseId && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsBatchDialogOpen(true)}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Enviar Lote
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingLesson(defaultLesson);
                      setIsDialogOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Aula
                  </Button>
                </div>
              )}
            </div>

            {selectedCourseId ? (
              lessonsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : lessons.length > 0 ? (
                <div className="space-y-3">
                  {lessons.map((lesson, idx) => (
                    <Card key={lesson.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{lesson.title}</h3>
                              {lesson.is_free && (
                                <Badge variant="secondary" className="text-xs">
                                  Gratuita
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              {lesson.duration_minutes && (
                                <span>{lesson.duration_minutes} min</span>
                              )}
                              {lesson.video_url && (
                                <span className="flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  Vídeo
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingLesson(lesson);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteLessonMutation.mutate(lesson.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  Nenhuma aula cadastrada para este curso
                </div>
              )
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-2 opacity-20" />
                Selecione um curso para gerenciar as aulas
              </div>
            )}
          </div>
        </div>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLesson?.id ? "Editar Aula" : "Nova Aula"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={editingLesson?.title || ""}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingLesson?.description || ""}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Conteúdo da Aula</Label>
                <Textarea
                  value={editingLesson?.content || ""}
                  onChange={(e) =>
                    setEditingLesson({ ...editingLesson, content: e.target.value })
                  }
                  rows={4}
                  placeholder="Texto da aula, instruções, etc..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL do Vídeo</Label>
                  <Input
                    value={editingLesson?.video_url || ""}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, video_url: e.target.value })
                    }
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração (minutos)</Label>
                  <Input
                    type="number"
                    value={editingLesson?.duration_minutes || ""}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, duration_minutes: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingLesson?.is_free || false}
                  onCheckedChange={(checked) =>
                    setEditingLesson({ ...editingLesson, is_free: checked })
                  }
                />
                <Label>Aula Gratuita (visível sem matrícula)</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saveLessonMutation.isPending}>
                  {saveLessonMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Batch Import Dialog */}
        <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Importar Aulas em Lote
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium">Formato do texto:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Primeira linha de cada bloco = título da aula</li>
                  <li>Linhas seguintes = conteúdo da aula</li>
                  <li>Separe as aulas com <code className="bg-background px-1 rounded">---</code> ou <code className="bg-background px-1 rounded">===</code></li>
                </ul>
                <div className="mt-3 p-3 bg-background rounded border text-xs font-mono">
                  <div className="text-primary"># Aula 1: Introdução</div>
                  <div className="text-muted-foreground">Conteúdo da primeira aula...</div>
                  <div className="text-muted-foreground">Mais texto aqui.</div>
                  <div className="text-primary my-1">---</div>
                  <div className="text-primary"># Aula 2: Fundamentos</div>
                  <div className="text-muted-foreground">Conteúdo da segunda aula...</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label>Carregar arquivo ou colar texto</Label>
                </div>
                
                {/* File Input */}
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".txt,.md,.text"
                    id="batch-file-input"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        // Sort files by name to maintain order
                        const sortedFiles = Array.from(files).sort((a, b) => 
                          a.name.localeCompare(b.name, undefined, { numeric: true })
                        );
                        
                        const allContents: string[] = [];
                        
                        for (const file of sortedFiles) {
                          const content = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              resolve(event.target?.result as string || '');
                            };
                            reader.readAsText(file);
                          });
                          
                          // Use filename (without extension) as title if content doesn't start with #
                          const fileName = file.name.replace(/\.(txt|md|text)$/i, '');
                          const trimmedContent = content.trim();
                          
                          if (trimmedContent.startsWith('#')) {
                            allContents.push(trimmedContent);
                          } else {
                            allContents.push(`# ${fileName}\n${trimmedContent}`);
                          }
                        }
                        
                        setBatchText(allContents.join('\n\n---\n\n'));
                        toast({ 
                          title: `${sortedFiles.length} arquivo(s) carregado(s)`,
                          description: "Verifique o conteúdo e clique em Importar"
                        });
                      }
                      e.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('batch-file-input')?.click()}
                    className="gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Selecionar Arquivos
                  </Button>
                  <span className="text-sm text-muted-foreground self-center">
                    Selecione múltiplos .txt ou .md
                  </span>
                </div>

                <Textarea
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  rows={12}
                  placeholder="Selecione arquivos ou cole o texto das aulas aqui..."
                  className="font-mono text-sm"
                />
              </div>

              {batchText && (
                <div className="text-sm text-muted-foreground">
                  Preview: {parseBatchText(batchText).length} aulas detectadas
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsBatchDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleBatchImport} 
                  disabled={batchImportMutation.isPending || !batchText.trim()}
                  className="gap-2"
                >
                  {batchImportMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Importar Aulas
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
