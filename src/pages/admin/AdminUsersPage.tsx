import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
  Users, 
  Search, 
  Shield, 
  Loader2, 
  MoreHorizontal,
  Eye,
  Mail,
  Award,
  BookOpen,
  TrendingUp,
  Calendar,
  GraduationCap,
  RefreshCw,
  Download,
  UserPlus,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  course_type: string | null;
  enrollment_date: string | null;
  created_at: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "instructor" | "student";
}

interface Enrollment {
  id: string;
  course_id: string;
  progress_percent: number | null;
  completed_at: string | null;
  courses: { title: string };
}

interface Certificate {
  id: string;
  course_id: string;
  issued_at: string;
  certificate_number: string;
  courses: { title: string };
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Fetch profiles
  const { data: profiles = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch all user roles
  const { data: userRoles = [] } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data as UserRole[];
    },
  });

  // Fetch courses for enrollment
  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("is_published", true)
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  // Fetch user details (enrollments + certificates)
  const { data: userDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ["admin-user-details", selectedUser?.id],
    enabled: !!selectedUser && detailsDialogOpen,
    queryFn: async () => {
      if (!selectedUser) return null;

      const [enrollments, certificates, lessonProgress] = await Promise.all([
        supabase
          .from("enrollments")
          .select("*, courses(title)")
          .eq("user_id", selectedUser.id),
        supabase
          .from("certificates")
          .select("*, courses(title)")
          .eq("user_id", selectedUser.id),
        supabase
          .from("lesson_progress")
          .select("id, completed")
          .eq("user_id", selectedUser.id),
      ]);

      return {
        enrollments: (enrollments.data || []) as Enrollment[],
        certificates: (certificates.data || []) as Certificate[],
        lessonsCompleted: (lessonProgress.data || []).filter(l => l.completed).length,
        totalLessons: (lessonProgress.data || []).length,
      };
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: role as "admin" | "instructor" | "student",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast({ title: "Papel atualizado com sucesso!" });
      setRoleDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar papel", variant: "destructive" });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ userId, subject, content }: { userId: string; subject: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: userId,
        subject,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Mensagem enviada com sucesso!" });
      setMessageDialogOpen(false);
      setMessageSubject("");
      setMessageContent("");
    },
    onError: () => {
      toast({ title: "Erro ao enviar mensagem", variant: "destructive" });
    },
  });

  // Enroll user mutation
  const enrollUserMutation = useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .single();

      if (existing) throw new Error("Usuário já está matriculado neste curso");

      const { error } = await supabase.from("enrollments").insert({
        user_id: userId,
        course_id: courseId,
        progress_percent: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
      toast({ title: "Usuário matriculado com sucesso!" });
      setEnrollDialogOpen(false);
      setSelectedCourseId("");
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao matricular", description: error.message, variant: "destructive" });
    },
  });

  const getUserRole = (userId: string) => {
    const role = userRoles.find((r) => r.user_id === userId);
    return role?.role || "student";
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500">Admin</Badge>;
      case "instructor":
        return <Badge className="bg-blue-500">Instrutor</Badge>;
      default:
        return <Badge variant="secondary">Aluno</Badge>;
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch = p.full_name?.toLowerCase().includes(search.toLowerCase());
    const role = getUserRole(p.id);
    const matchesRole = filterRole === "all" || role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Stats
  const totalUsers = profiles.length;
  const adminCount = profiles.filter(p => getUserRole(p.id) === "admin").length;
  const instructorCount = profiles.filter(p => getUserRole(p.id) === "instructor").length;
  const studentCount = profiles.filter(p => getUserRole(p.id) === "student").length;

  const exportToCSV = () => {
    const headers = ["Nome", "Telefone", "Tipo de Curso", "Data Cadastro", "Papel"];
    const rows = filteredProfiles.map(p => [
      p.full_name || "Sem nome",
      p.phone || "",
      p.course_type || "",
      p.created_at ? format(new Date(p.created_at), "dd/MM/yyyy") : "",
      getUserRole(p.id),
    ]);

    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuarios_${format(new Date(), "dd-MM-yyyy")}.csv`;
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
              <Users className="w-8 h-8 text-primary" />
              Gerenciar Usuários
            </h1>
            <p className="text-muted-foreground mt-1">
              {totalUsers} usuários cadastrados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{adminCount}</p>
                  <p className="text-xs text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{instructorCount}</p>
                  <p className="text-xs text-muted-foreground">Instrutores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{studentCount}</p>
                  <p className="text-xs text-muted-foreground">Alunos</p>
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
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <Shield className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por papel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="instructor">Instrutores</SelectItem>
              <SelectItem value="student">Alunos</SelectItem>
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Tipo de Curso</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {profile.full_name || "Sem nome"}
                      </TableCell>
                      <TableCell>{profile.phone || "-"}</TableCell>
                      <TableCell>
                        {profile.course_type || "Não definido"}
                      </TableCell>
                      <TableCell>
                        {profile.created_at
                          ? format(new Date(profile.created_at), "dd/MM/yyyy", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell>{getRoleBadge(getUserRole(profile.id))}</TableCell>
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
                                setSelectedUser(profile);
                                setDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(profile);
                                setMessageDialogOpen(true);
                              }}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Enviar Mensagem
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(profile);
                                setEnrollDialogOpen(true);
                              }}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Matricular em Curso
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(profile);
                                setRoleDialogOpen(true);
                              }}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Alterar Papel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Papel do Usuário</DialogTitle>
            <DialogDescription>
              Usuário: <strong>{selectedUser?.full_name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              defaultValue={selectedUser ? getUserRole(selectedUser.id) : "student"}
              onValueChange={(value) => {
                if (selectedUser) {
                  updateRoleMutation.mutate({ userId: selectedUser.id, role: value });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Aluno</SelectItem>
                <SelectItem value="instructor">Instrutor</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detalhes do Usuário
            </DialogTitle>
          </DialogHeader>
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedUser?.full_name || "Sem nome"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedUser?.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Curso</p>
                  <p className="font-medium">{selectedUser?.course_type || "Não definido"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Papel</p>
                  {selectedUser && getRoleBadge(getUserRole(selectedUser.id))}
                </div>
              </div>

              {/* Enrollments */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4" />
                  Matrículas ({userDetails?.enrollments.length || 0})
                </h4>
                {userDetails?.enrollments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma matrícula</p>
                ) : (
                  <div className="space-y-2">
                    {userDetails?.enrollments.map((e) => (
                      <div key={e.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">{e.courses?.title}</span>
                        <div className="flex items-center gap-3">
                          <Progress value={e.progress_percent || 0} className="w-20 h-2" />
                          <span className="text-xs text-muted-foreground w-10">
                            {e.progress_percent || 0}%
                          </span>
                          {e.completed_at ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certificates */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4" />
                  Certificados ({userDetails?.certificates.length || 0})
                </h4>
                {userDetails?.certificates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum certificado</p>
                ) : (
                  <div className="space-y-2">
                    {userDetails?.certificates.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">{c.courses?.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{c.certificate_number}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(c.issued_at), "dd/MM/yyyy")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{userDetails?.lessonsCompleted || 0}</p>
                      <p className="text-xs text-muted-foreground">Aulas Completas</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{userDetails?.certificates.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Certificados</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Enviar Mensagem
            </DialogTitle>
            <DialogDescription>
              Para: <strong>{selectedUser?.full_name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Assunto</label>
              <Input
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Assunto da mensagem"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mensagem</label>
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Escreva sua mensagem..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedUser && messageSubject && messageContent) {
                  sendMessageMutation.mutate({
                    userId: selectedUser.id,
                    subject: messageSubject,
                    content: messageContent,
                  });
                }
              }}
              disabled={!messageSubject || !messageContent || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enroll Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Matricular em Curso
            </DialogTitle>
            <DialogDescription>
              Usuário: <strong>{selectedUser?.full_name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedUser && selectedCourseId) {
                  enrollUserMutation.mutate({
                    userId: selectedUser.id,
                    courseId: selectedCourseId,
                  });
                }
              }}
              disabled={!selectedCourseId || enrollUserMutation.isPending}
            >
              {enrollUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Matricular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
