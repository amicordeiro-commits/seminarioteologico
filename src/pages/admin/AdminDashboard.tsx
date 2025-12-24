import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Calendar,
  FileText,
  MessageSquare,
  Library
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, courses, enrollments, certificates, events, materials] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
        supabase.from("certificates").select("id", { count: "exact", head: true }),
        supabase.from("calendar_events").select("id", { count: "exact", head: true }),
        supabase.from("library_materials").select("id", { count: "exact", head: true }),
      ]);

      return {
        users: users.count || 0,
        courses: courses.count || 0,
        enrollments: enrollments.count || 0,
        certificates: certificates.count || 0,
        events: events.count || 0,
        materials: materials.count || 0,
      };
    },
  });

  const statCards = [
    { title: "Usuários", value: stats?.users || 0, icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { title: "Cursos", value: stats?.courses || 0, icon: BookOpen, color: "text-green-500", bgColor: "bg-green-500/10" },
    { title: "Matrículas", value: stats?.enrollments || 0, icon: TrendingUp, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { title: "Certificados", value: stats?.certificates || 0, icon: GraduationCap, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { title: "Eventos", value: stats?.events || 0, icon: Calendar, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
    { title: "Materiais", value: stats?.materials || 0, icon: Library, color: "text-pink-500", bgColor: "bg-pink-500/10" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="/admin/courses" className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <p className="font-medium">Gerenciar Cursos</p>
                <p className="text-sm text-muted-foreground">Adicionar, editar ou remover cursos</p>
              </a>
              <a href="/admin/users" className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <p className="font-medium">Gerenciar Usuários</p>
                <p className="text-sm text-muted-foreground">Visualizar e gerenciar alunos</p>
              </a>
              <a href="/admin/library" className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <p className="font-medium">Biblioteca</p>
                <p className="text-sm text-muted-foreground">Adicionar materiais de estudo</p>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium">Sistema Operacional</p>
                    <p className="text-xs text-muted-foreground">Todos os serviços funcionando</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{stats?.enrollments || 0} matrículas ativas</p>
                    <p className="text-xs text-muted-foreground">Alunos matriculados em cursos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-sm font-medium">{stats?.certificates || 0} certificados emitidos</p>
                    <p className="text-xs text-muted-foreground">Total de conclusões</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
