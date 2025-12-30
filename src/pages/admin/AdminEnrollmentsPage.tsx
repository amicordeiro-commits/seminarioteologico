import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  GraduationCap, 
  Search, 
  Loader2, 
  MoreHorizontal,
  Eye,
  Trash2,
  Award,
  RefreshCw,
  UserCheck,
  BookOpen,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress_percent: number | null;
  completed_at: string | null;
  courses: {
    id: string;
    title: string;
    total_lessons: number | null;
  };
  profiles: {
    id: string;
    full_name: string | null;
  };
}

export default function AdminEnrollmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueCertDialogOpen, setIssueCertDialogOpen] = useState(false);

  // Fetch enrollments with profiles and courses
  const { data: enrollments = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          courses:course_id (id, title, total_lessons),
          profiles:user_id (id, full_name)
        `)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;
      return data as Enrollment[];
    },
  });

  // Fetch courses for filter
  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  // Delete enrollment mutation
  const deleteMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
      toast({ title: "Matrícula removida com sucesso!" });
      setDeleteDialogOpen(false);
      setSelectedEnrollment(null);
    },
    onError: () => {
      toast({ title: "Erro ao remover matrícula", variant: "destructive" });
    },
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ enrollmentId, progress }: { enrollmentId: string; progress: number }) => {
      const updates: { progress_percent: number; completed_at?: string | null } = {
        progress_percent: progress,
      };
      
      if (progress >= 100) {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const { error } = await supabase
        .from("enrollments")
        .update(updates)
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
      toast({ title: "Progresso atualizado!" });
    },
  });

  // Issue certificate mutation
  const issueCertificateMutation = useMutation({
    mutationFn: async (enrollment: Enrollment) => {
      // Check if certificate already exists
      const { data: existing } = await supabase
        .from("certificates")
        .select("id")
        .eq("user_id", enrollment.user_id)
        .eq("course_id", enrollment.course_id)
        .single();

      if (existing) {
        throw new Error("Certificado já emitido para este aluno neste curso");
      }

      // Generate certificate number
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { error } = await supabase.from("certificates").insert({
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        certificate_number: certificateNumber,
        issued_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Certificado emitido com sucesso!" });
      setIssueCertDialogOpen(false);
      setSelectedEnrollment(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao emitir certificado", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((e) => {
    const matchesSearch = 
      e.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.courses?.title?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCourse = filterCourse === "all" || e.course_id === filterCourse;
    
    const isCompleted = e.completed_at !== null || (e.progress_percent || 0) >= 100;
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "completed" && isCompleted) ||
      (filterStatus === "in_progress" && !isCompleted);

    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Stats
  const totalEnrollments = enrollments.length;
  const completedEnrollments = enrollments.filter(e => e.completed_at || (e.progress_percent || 0) >= 100).length;
  const avgProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress_percent || 0), 0) / enrollments.length)
    : 0;

  const exportToCSV = () => {
    const headers = ["Aluno", "Curso", "Data Matrícula", "Progresso", "Concluído"];
    const rows = filteredEnrollments.map(e => [
      e.profiles?.full_name || "Sem nome",
      e.courses?.title || "",
      format(new Date(e.enrolled_at), "dd/MM/yyyy"),
      `${e.progress_percent || 0}%`,
      e.completed_at ? "Sim" : "Não"
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `matriculas_${format(new Date(), "dd-MM-yyyy")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Gerenciar Matrículas
            </h1>
            <p className="text-muted-foreground mt-1">
              {totalEnrollments} matrículas no total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-1" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalEnrollments}</p>
                  <p className="text-sm text-muted-foreground">Total de Matrículas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedEnrollments}</p>
                  <p className="text-sm text-muted-foreground">Cursos Concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgProgress}%</p>
                  <p className="text-sm text-muted-foreground">Progresso Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por aluno ou curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cursos</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Data Matrícula</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma matrícula encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((enrollment) => {
                    const isCompleted = enrollment.completed_at || (enrollment.progress_percent || 0) >= 100;
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-primary" />
                            </div>
                            {enrollment.profiles?.full_name || "Sem nome"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{enrollment.courses?.title}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(enrollment.enrolled_at), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-32 space-y-1">
                            <Progress value={enrollment.progress_percent || 0} className="h-2" />
                            <span className="text-xs text-muted-foreground">
                              {enrollment.progress_percent || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isCompleted ? (
                            <Badge className="bg-emerald-500">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Concluído
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Em andamento
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  const newProgress = prompt("Digite o novo progresso (0-100):", String(enrollment.progress_percent || 0));
                                  if (newProgress !== null) {
                                    const progress = Math.min(100, Math.max(0, parseInt(newProgress) || 0));
                                    updateProgressMutation.mutate({ 
                                      enrollmentId: enrollment.id, 
                                      progress 
                                    });
                                  }
                                }}
                              >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Alterar Progresso
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEnrollment(enrollment);
                                  setIssueCertDialogOpen(true);
                                }}
                                disabled={!isCompleted}
                              >
                                <Award className="w-4 h-4 mr-2" />
                                Emitir Certificado
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedEnrollment(enrollment);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover Matrícula
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Matrícula</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover a matrícula de{" "}
              <strong>{selectedEnrollment?.profiles?.full_name}</strong> do curso{" "}
              <strong>{selectedEnrollment?.courses?.title}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedEnrollment && deleteMutation.mutate(selectedEnrollment.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Certificate Dialog */}
      <Dialog open={issueCertDialogOpen} onOpenChange={setIssueCertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emitir Certificado</DialogTitle>
            <DialogDescription>
              Emitir certificado de conclusão para{" "}
              <strong>{selectedEnrollment?.profiles?.full_name}</strong> no curso{" "}
              <strong>{selectedEnrollment?.courses?.title}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueCertDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => selectedEnrollment && issueCertificateMutation.mutate(selectedEnrollment)}
              disabled={issueCertificateMutation.isPending}
            >
              {issueCertificateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Award className="w-4 h-4 mr-2" />
              Emitir Certificado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
