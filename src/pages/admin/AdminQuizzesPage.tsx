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
import { ClipboardList, Plus, Pencil, Trash2, Loader2, ListChecks, HelpCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  lesson_id: string | null;
  passing_score: number | null;
  time_limit_minutes: number | null;
  is_published: boolean | null;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string | null;
  order_index: number;
  points: number | null;
}

interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean | null;
  order_index: number;
}

interface Course {
  id: string;
  title: string;
}

const defaultQuiz: Partial<Quiz> = {
  title: "",
  description: "",
  passing_score: 70,
  time_limit_minutes: 30,
  is_published: false,
};

const defaultQuestion: Partial<QuizQuestion> = {
  question_text: "",
  question_type: "multiple_choice",
  points: 1,
};

export default function AdminQuizzesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Partial<Quiz> | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuizQuestion> | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [newOptions, setNewOptions] = useState<Array<{ text: string; isCorrect: boolean }>>([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses-for-quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data as Course[];
    },
  });

  // Fetch quizzes
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["admin-quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Quiz[];
    },
  });

  // Fetch questions for selected quiz
  const { data: questions = [] } = useQuery({
    queryKey: ["admin-quiz-questions", selectedQuizId],
    queryFn: async () => {
      if (!selectedQuizId) return [];
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", selectedQuizId)
        .order("order_index");
      if (error) throw error;
      return data as QuizQuestion[];
    },
    enabled: !!selectedQuizId,
  });

  // Fetch options for all questions
  const { data: options = [] } = useQuery({
    queryKey: ["admin-quiz-options", selectedQuizId],
    queryFn: async () => {
      if (!selectedQuizId) return [];
      const questionIds = questions.map((q) => q.id);
      if (questionIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("quiz_options")
        .select("*")
        .in("question_id", questionIds)
        .order("order_index");
      if (error) throw error;
      return data as QuizOption[];
    },
    enabled: !!selectedQuizId && questions.length > 0,
  });

  // Save quiz mutation
  const saveQuizMutation = useMutation({
    mutationFn: async (quiz: Partial<Quiz>) => {
      if (quiz.id) {
        const { error } = await supabase
          .from("quizzes")
          .update({
            title: quiz.title,
            description: quiz.description,
            course_id: quiz.course_id,
            passing_score: quiz.passing_score,
            time_limit_minutes: quiz.time_limit_minutes,
            is_published: quiz.is_published,
          })
          .eq("id", quiz.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quizzes").insert({
          title: quiz.title!,
          description: quiz.description,
          course_id: quiz.course_id!,
          passing_score: quiz.passing_score,
          time_limit_minutes: quiz.time_limit_minutes,
          is_published: quiz.is_published,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
      toast({ title: "Quiz salvo com sucesso!" });
      setIsQuizDialogOpen(false);
      setEditingQuiz(null);
    },
    onError: () => {
      toast({ title: "Erro ao salvar quiz", variant: "destructive" });
    },
  });

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quizzes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
      toast({ title: "Quiz excluído!" });
      if (selectedQuizId) setSelectedQuizId(null);
    },
    onError: () => {
      toast({ title: "Erro ao excluir quiz", variant: "destructive" });
    },
  });

  // Save question mutation
  const saveQuestionMutation = useMutation({
    mutationFn: async (question: Partial<QuizQuestion>) => {
      if (question.id) {
        const { error } = await supabase
          .from("quiz_questions")
          .update({
            question_text: question.question_text,
            question_type: question.question_type,
            points: question.points,
          })
          .eq("id", question.id);
        if (error) throw error;
        
        // Update options
        await supabase.from("quiz_options").delete().eq("question_id", question.id);
        const optionsToInsert = newOptions
          .filter((o) => o.text.trim())
          .map((o, idx) => ({
            question_id: question.id!,
            option_text: o.text,
            is_correct: o.isCorrect,
            order_index: idx,
          }));
        if (optionsToInsert.length > 0) {
          const { error: optError } = await supabase.from("quiz_options").insert(optionsToInsert);
          if (optError) throw optError;
        }
      } else {
        const { data, error } = await supabase
          .from("quiz_questions")
          .insert({
            quiz_id: selectedQuizId!,
            question_text: question.question_text!,
            question_type: question.question_type,
            points: question.points,
            order_index: questions.length,
          })
          .select()
          .single();
        if (error) throw error;

        // Insert options
        const optionsToInsert = newOptions
          .filter((o) => o.text.trim())
          .map((o, idx) => ({
            question_id: data.id,
            option_text: o.text,
            is_correct: o.isCorrect,
            order_index: idx,
          }));
        if (optionsToInsert.length > 0) {
          const { error: optError } = await supabase.from("quiz_options").insert(optionsToInsert);
          if (optError) throw optError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-options"] });
      toast({ title: "Questão salva com sucesso!" });
      setIsQuestionDialogOpen(false);
      setEditingQuestion(null);
      setNewOptions([
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
    },
    onError: () => {
      toast({ title: "Erro ao salvar questão", variant: "destructive" });
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("quiz_options").delete().eq("question_id", id);
      const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions"] });
      toast({ title: "Questão excluída!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir questão", variant: "destructive" });
    },
  });

  const handleSaveQuiz = () => {
    if (!editingQuiz?.title || !editingQuiz?.course_id) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    saveQuizMutation.mutate(editingQuiz);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion?.question_text) {
      toast({ title: "Preencha a pergunta", variant: "destructive" });
      return;
    }
    const filledOptions = newOptions.filter((o) => o.text.trim());
    if (filledOptions.length < 2) {
      toast({ title: "Adicione pelo menos 2 opções", variant: "destructive" });
      return;
    }
    if (!filledOptions.some((o) => o.isCorrect)) {
      toast({ title: "Marque pelo menos uma opção correta", variant: "destructive" });
      return;
    }
    saveQuestionMutation.mutate(editingQuestion);
  };

  const getCourseName = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.title || "Curso não encontrado";
  };

  const openEditQuestion = async (question: QuizQuestion) => {
    const questionOptions = options.filter((o) => o.question_id === question.id);
    setEditingQuestion(question);
    setNewOptions(
      questionOptions.length > 0
        ? questionOptions.map((o) => ({ text: o.option_text, isCorrect: o.is_correct || false }))
        : [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ]
    );
    setIsQuestionDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-primary" />
              Gerenciar Quizzes
            </h1>
            <p className="text-muted-foreground mt-1">
              {quizzes.length} quizzes cadastrados
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingQuiz(defaultQuiz);
              setIsQuizDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Quiz
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quizzes List */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Quizzes</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <Card
                    key={quiz.id}
                    className={`cursor-pointer transition-colors ${
                      selectedQuizId === quiz.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedQuizId(quiz.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{quiz.title}</CardTitle>
                            <Badge variant={quiz.is_published ? "default" : "secondary"}>
                              {quiz.is_published ? "Publicado" : "Rascunho"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getCourseName(quiz.course_id)}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Nota mínima: {quiz.passing_score}%</span>
                            {quiz.time_limit_minutes && (
                              <span>Tempo: {quiz.time_limit_minutes}min</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingQuiz(quiz);
                              setIsQuizDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteQuizMutation.mutate(quiz.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {quizzes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum quiz cadastrado
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                {selectedQuizId ? "Questões" : "Selecione um Quiz"}
              </h2>
              {selectedQuizId && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingQuestion(defaultQuestion);
                    setNewOptions([
                      { text: "", isCorrect: true },
                      { text: "", isCorrect: false },
                      { text: "", isCorrect: false },
                      { text: "", isCorrect: false },
                    ]);
                    setIsQuestionDialogOpen(true);
                  }}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Nova Questão
                </Button>
              )}
            </div>
            
            {selectedQuizId ? (
              <div className="space-y-3">
                {questions.map((question, idx) => {
                  const questionOptions = options.filter((o) => o.question_id === question.id);
                  return (
                    <Card key={question.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {idx + 1}
                              </Badge>
                              <span className="font-medium text-sm">{question.question_text}</span>
                            </div>
                            <div className="pl-6 space-y-1">
                              {questionOptions.map((opt) => (
                                <div
                                  key={opt.id}
                                  className={`text-xs flex items-center gap-2 ${
                                    opt.is_correct ? "text-green-600 font-medium" : "text-muted-foreground"
                                  }`}
                                >
                                  <span>{opt.is_correct ? "✓" : "○"}</span>
                                  {opt.option_text}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditQuestion(question)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteQuestionMutation.mutate(question.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {questions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    Nenhuma questão cadastrada
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ListChecks className="w-12 h-12 mx-auto mb-2 opacity-20" />
                Selecione um quiz para ver as questões
              </div>
            )}
          </div>
        </div>

        {/* Quiz Dialog */}
        <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingQuiz?.id ? "Editar Quiz" : "Novo Quiz"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={editingQuiz?.title || ""}
                  onChange={(e) =>
                    setEditingQuiz({ ...editingQuiz, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingQuiz?.description || ""}
                  onChange={(e) =>
                    setEditingQuiz({ ...editingQuiz, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Curso *</Label>
                <Select
                  value={editingQuiz?.course_id || ""}
                  onValueChange={(value) =>
                    setEditingQuiz({ ...editingQuiz, course_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nota Mínima (%)</Label>
                  <Input
                    type="number"
                    value={editingQuiz?.passing_score || 70}
                    onChange={(e) =>
                      setEditingQuiz({ ...editingQuiz, passing_score: parseInt(e.target.value) || 70 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tempo (minutos)</Label>
                  <Input
                    type="number"
                    value={editingQuiz?.time_limit_minutes || ""}
                    onChange={(e) =>
                      setEditingQuiz({ ...editingQuiz, time_limit_minutes: parseInt(e.target.value) || null })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingQuiz?.is_published || false}
                  onCheckedChange={(checked) =>
                    setEditingQuiz({ ...editingQuiz, is_published: checked })
                  }
                />
                <Label>Publicado</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsQuizDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveQuiz} disabled={saveQuizMutation.isPending}>
                  {saveQuizMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Question Dialog */}
        <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion?.id ? "Editar Questão" : "Nova Questão"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pergunta *</Label>
                <Textarea
                  value={editingQuestion?.question_text || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question_text: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Pontos</Label>
                <Input
                  type="number"
                  value={editingQuestion?.points || 1}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Opções de Resposta</Label>
                <div className="space-y-2">
                  {newOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct-option"
                        checked={opt.isCorrect}
                        onChange={() => {
                          setNewOptions(
                            newOptions.map((o, i) => ({
                              ...o,
                              isCorrect: i === idx,
                            }))
                          );
                        }}
                        className="w-4 h-4 text-primary"
                      />
                      <Input
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[idx].text = e.target.value;
                          setNewOptions(updated);
                        }}
                        placeholder={`Opção ${idx + 1}`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecione a opção correta com o botão de rádio
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveQuestion} disabled={saveQuestionMutation.isPending}>
                  {saveQuestionMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
