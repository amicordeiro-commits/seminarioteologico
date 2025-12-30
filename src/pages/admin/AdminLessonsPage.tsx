import { useState, useRef, useCallback } from "react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayCircle, Plus, Pencil, Trash2, Loader2, Video, Upload, FileText, FolderOpen, BookOpen, Settings, X, Bold, Italic, Underline, Heading1, Heading2, Heading3, List, ListOrdered, AlignLeft, AlignCenter, AlignJustify, Palette, Type } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  
  // Refs e estado para o editor
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  
  // Salva a seleção atual do textarea
  const saveSelection = useCallback(() => {
    if (textareaRef.current) {
      setSelection({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      });
    }
  }, []);
  
  // Aplica formatação ao texto selecionado
  const applyFormat = useCallback((before: string, after: string = before) => {
    const text = editingLesson?.content || "";
    const selectedText = text.substring(selection.start, selection.end);
    const newText = text.substring(0, selection.start) + before + selectedText + after + text.substring(selection.end);
    setEditingLesson({ ...editingLesson, content: newText });
  }, [editingLesson, selection]);
  
  // Insere texto na posição do cursor
  const insertText = useCallback((insertedText: string) => {
    const text = editingLesson?.content || "";
    const newText = text.substring(0, selection.start) + insertedText + text.substring(selection.start);
    setEditingLesson({ ...editingLesson, content: newText });
  }, [editingLesson, selection]);

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
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <PlayCircle className="w-7 h-7" />
              </div>
              Gerenciar Aulas
            </h1>
            <p className="text-muted-foreground">
              Organize o conteúdo de cada curso
            </p>
          </div>
          {selectedCourseId && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBatchDialogOpen(true)}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Importar Lote
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Courses List */}
          <Card className="lg:col-span-1 overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                Cursos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {coursesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        selectedCourseId === course.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-background hover:bg-muted/80 border border-border/50 hover:border-primary/30"
                      }`}
                    >
                      <span className="font-medium text-sm line-clamp-2">{course.title}</span>
                    </button>
                  ))}
                  {courses.length === 0 && (
                    <p className="text-center text-muted-foreground py-6 text-sm">
                      Nenhum curso cadastrado
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lessons List */}
          <div className="lg:col-span-3 space-y-4">
            {selectedCourseId ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif font-semibold text-xl">
                      Aulas do Curso
                    </h2>
                    <Badge variant="outline" className="font-normal">
                      {lessons.length} {lessons.length === 1 ? 'aula' : 'aulas'}
                    </Badge>
                  </div>
                </div>

                {lessonsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : lessons.length > 0 ? (
                  <div className="space-y-2.5">
                    {lessons.map((lesson, idx) => (
                      <Card 
                        key={lesson.id} 
                        className="group hover:shadow-md transition-all duration-200 border-border/60 hover:border-primary/30"
                      >
                        <CardContent className="p-0">
                          <div className="flex items-center">
                            {/* Lesson number */}
                            <div className="flex items-center justify-center w-14 h-full min-h-[4.5rem] bg-muted/40 border-r border-border/50">
                              <span className="text-lg font-serif font-bold text-primary/80">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 p-4 min-w-0">
                              <div className="flex items-start gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground leading-tight">
                                  {lesson.title}
                                </h3>
                                {lesson.is_free && (
                                  <Badge className="bg-success/10 text-success border-success/20 text-xs">
                                    Gratuita
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                {lesson.duration_minutes && lesson.duration_minutes > 0 && (
                                  <span className="flex items-center gap-1.5">
                                    <PlayCircle className="w-3.5 h-3.5" />
                                    {lesson.duration_minutes} min
                                  </span>
                                )}
                                {lesson.video_url && (
                                  <span className="flex items-center gap-1.5 text-primary/70">
                                    <Video className="w-3.5 h-3.5" />
                                    Vídeo
                                  </span>
                                )}
                                {lesson.content && (
                                  <span className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    Texto
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                                onClick={() => {
                                  setEditingLesson(lesson);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
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
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <PlayCircle className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">Nenhuma aula cadastrada</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Comece adicionando aulas a este curso
                      </p>
                      <Button
                        onClick={() => {
                          setEditingLesson(defaultLesson);
                          setIsDialogOpen(true);
                        }}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Primeira Aula
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FolderOpen className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="font-serif font-semibold text-xl mb-2">Selecione um Curso</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Escolha um curso na lista ao lado para visualizar e gerenciar suas aulas
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Dialog de Edição Melhorado */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="!fixed !inset-0 !max-w-none !w-screen !h-screen !translate-x-0 !translate-y-0 !left-0 !top-0 flex flex-col p-0 gap-0 bg-background overflow-hidden !rounded-none border-none">
            <DialogHeader className="px-6 py-4 border-b bg-muted/30 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-serif">
                      {editingLesson?.id ? "Editar Aula" : "Nova Aula"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      {editingLesson?.title || "Configure os detalhes da aula"}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saveLessonMutation.isPending}>
                    {saveLessonMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Salvar Aula
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 border-b bg-background">
                <TabsList className="h-12 bg-transparent gap-2">
                  <TabsTrigger value="content" className="gap-2 data-[state=active]:bg-primary/10">
                    <FileText className="w-4 h-4" />
                    Conteúdo
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary/10">
                    <Settings className="w-4 h-4" />
                    Configurações
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Aba de Conteúdo - Editor em Tela Cheia */}
              <TabsContent value="content" className="flex-1 flex flex-col m-0 overflow-hidden">
                <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Conteúdo da Aula</Label>
                    <span className="text-xs text-muted-foreground">
                      {(editingLesson?.content || "").length.toLocaleString()} caracteres
                    </span>
                  </div>
                  
                  {/* Barra de Ferramentas de Formatação */}
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 rounded-lg border">
                    {/* Formatação de Texto */}
                    <div className="flex items-center gap-0.5 pr-2 border-r">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Negrito"
                        onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        onClick={() => applyFormat("**", "**")}
                      >
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Itálico"
                        onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        onClick={() => applyFormat("*", "*")}
                      >
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Sublinhado"
                        onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        onClick={() => applyFormat("<u>", "</u>")}
                      >
                        <Underline className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Cabeçalhos */}
                    <div className="flex items-center gap-0.5 px-2 border-r">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Título Principal"
                        onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        onClick={() => applyFormat("# ", "")}
                      >
                        <Heading1 className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Subtítulo"
                        onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        onClick={() => applyFormat("## ", "")}
                      >
                        <Heading2 className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Subtítulo Menor"
                        onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        onClick={() => applyFormat("### ", "")}
                      >
                        <Heading3 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Listas */}
                    <div className="flex items-center gap-0.5 px-2 border-r">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Lista com Marcadores"
                        onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        onClick={() => insertText("\n- Item 1\n- Item 2\n- Item 3\n")}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Lista Numerada"
                        onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        onClick={() => insertText("\n1. Item 1\n2. Item 2\n3. Item 3\n")}
                      >
                        <ListOrdered className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Alinhamento */}
                    <div className="flex items-center gap-0.5 px-2 border-r">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Alinhar à Esquerda"
                        onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        onClick={() => applyFormat('<div style="text-align: left">', '</div>')}
                      >
                        <AlignLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Centralizar"
                        onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        onClick={() => applyFormat('<div style="text-align: center">', '</div>')}
                      >
                        <AlignCenter className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Justificar"
                        onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        onClick={() => applyFormat('<div style="text-align: justify">', '</div>')}
                      >
                        <AlignJustify className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Cores */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 gap-1"
                          title="Cor do Texto"
                          onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        >
                          <Palette className="w-4 h-4" />
                          <span className="text-xs">Cor</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-6 gap-1">
                          {[
                            "#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#FFFFFF",
                            "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
                            "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
                            "#8B5CF6", "#A855F7", "#D946EF", "#EC4899", "#F43F5E", "#78350F",
                          ].map((color) => (
                            <button
                              key={color}
                              type="button"
                              className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              onClick={() => applyFormat(`<span style="color: ${color}">`, '</span>')}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    {/* Tamanho da Fonte */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 gap-1"
                          title="Tamanho da Fonte"
                          onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                        >
                          <Type className="w-4 h-4" />
                          <span className="text-xs">Tamanho</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="flex flex-col gap-1">
                          {[
                            { label: "Pequeno", size: "12px" },
                            { label: "Normal", size: "16px" },
                            { label: "Médio", size: "18px" },
                            { label: "Grande", size: "24px" },
                            { label: "Muito Grande", size: "32px" },
                            { label: "Título", size: "48px" },
                          ].map((option) => (
                            <button
                              key={option.size}
                              type="button"
                              className="px-3 py-1.5 text-left hover:bg-muted rounded text-sm"
                              onClick={() => applyFormat(`<span style="font-size: ${option.size}">`, '</span>')}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <Textarea
                    ref={textareaRef}
                    data-content-editor
                    value={editingLesson?.content || ""}
                    onChange={(e) =>
                      setEditingLesson({ ...editingLesson, content: e.target.value })
                    }
                    onSelect={saveSelection}
                    onKeyUp={saveSelection}
                    onClick={saveSelection}
                    placeholder="Digite ou cole o conteúdo completo da aula aqui...

Selecione o texto e use a barra de ferramentas para formatar:
• Negrito, Itálico, Sublinhado
• Títulos e Subtítulos
• Cores e Tamanhos de Fonte
• Listas e Alinhamento"
                    className="flex-1 min-h-0 font-mono text-sm resize-none"
                  />
                </div>
              </TabsContent>
              
              {/* Aba de Configurações */}
              <TabsContent value="settings" className="flex-1 m-0 overflow-auto">
                <ScrollArea className="h-full">
                  <div className="max-w-2xl mx-auto p-6 space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Informações Básicas</h3>
                      
                      <div className="space-y-2">
                        <Label>Título da Aula *</Label>
                        <Input
                          value={editingLesson?.title || ""}
                          onChange={(e) =>
                            setEditingLesson({ ...editingLesson, title: e.target.value })
                          }
                          placeholder="Ex: Introdução à Teologia Sistemática"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Descrição (opcional)</Label>
                        <Textarea
                          value={editingLesson?.description || ""}
                          onChange={(e) =>
                            setEditingLesson({ ...editingLesson, description: e.target.value })
                          }
                          rows={3}
                          placeholder="Uma breve descrição do que será abordado nesta aula..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Mídia e Duração</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>URL do Vídeo (opcional)</Label>
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
                            placeholder="15"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Acesso</h3>
                      
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="space-y-1">
                          <Label className="text-base">Aula Gratuita</Label>
                          <p className="text-sm text-muted-foreground">
                            Permite que alunos não matriculados visualizem esta aula
                          </p>
                        </div>
                        <Switch
                          checked={editingLesson?.is_free || false}
                          onCheckedChange={(checked) =>
                            setEditingLesson({ ...editingLesson, is_free: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
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
