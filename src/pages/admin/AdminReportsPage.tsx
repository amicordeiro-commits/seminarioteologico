import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  Download, 
  Loader2,
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Calendar,
  FileText,
  PieChart,
  Activity,
  Clock,
  Award,
  RefreshCw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from "recharts";

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("6months");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch comprehensive stats
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["admin-reports-stats", period],
    queryFn: async () => {
      const now = new Date();
      let startDate = subMonths(now, 6);
      
      if (period === "1month") startDate = subMonths(now, 1);
      else if (period === "3months") startDate = subMonths(now, 3);
      else if (period === "1year") startDate = subMonths(now, 12);

      // Basic counts
      const [users, courses, enrollments, certificates, lessons, quizAttempts] = await Promise.all([
        supabase.from("profiles").select("id, created_at, full_name"),
        supabase.from("courses").select("id, title, category, is_published"),
        supabase.from("enrollments").select("id, enrolled_at, progress_percent, completed_at, course_id, user_id"),
        supabase.from("certificates").select("id, issued_at, course_id, user_id"),
        supabase.from("lessons").select("id, course_id"),
        supabase.from("quiz_attempts").select("id, score, passed, completed_at"),
      ]);

      // Monthly data for charts
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(now, i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        const monthEnrollments = (enrollments.data || []).filter(e => 
          new Date(e.enrolled_at) >= start && new Date(e.enrolled_at) <= end
        ).length;

        const monthCertificates = (certificates.data || []).filter(c => 
          new Date(c.issued_at) >= start && new Date(c.issued_at) <= end
        ).length;

        const monthUsers = (users.data || []).filter(u => 
          u.created_at && new Date(u.created_at) >= start && new Date(u.created_at) <= end
        ).length;

        monthlyData.push({
          month: format(date, "MMM", { locale: ptBR }),
          enrollments: monthEnrollments,
          certificates: monthCertificates,
          users: monthUsers,
        });
      }

      // Course distribution
      const coursesByCategory: Record<string, number> = {};
      (courses.data || []).forEach(c => {
        const cat = c.category || "Outros";
        coursesByCategory[cat] = (coursesByCategory[cat] || 0) + 1;
      });

      const categoryColors = ["#8B4C5C", "#C9A029", "#4A7043", "#3B82F6", "#8B5CF6"];
      const courseDistribution = Object.entries(coursesByCategory).map(([name, value], i) => ({
        name,
        value,
        color: categoryColors[i % categoryColors.length],
      }));

      // Enrollment by course
      const enrollmentsByCourse: Record<string, { count: number; completed: number }> = {};
      (enrollments.data || []).forEach(e => {
        if (!enrollmentsByCourse[e.course_id]) {
          enrollmentsByCourse[e.course_id] = { count: 0, completed: 0 };
        }
        enrollmentsByCourse[e.course_id].count++;
        if (e.completed_at || (e.progress_percent || 0) >= 100) {
          enrollmentsByCourse[e.course_id].completed++;
        }
      });

      const courseEnrollmentData = (courses.data || []).map(c => ({
        name: c.title.substring(0, 20) + (c.title.length > 20 ? "..." : ""),
        fullName: c.title,
        enrollments: enrollmentsByCourse[c.id]?.count || 0,
        completed: enrollmentsByCourse[c.id]?.completed || 0,
      })).sort((a, b) => b.enrollments - a.enrollments);

      // Quiz performance
      const quizStats = {
        total: quizAttempts.data?.length || 0,
        passed: quizAttempts.data?.filter(q => q.passed).length || 0,
        avgScore: quizAttempts.data?.length 
          ? Math.round(quizAttempts.data.reduce((acc, q) => acc + (q.score || 0), 0) / quizAttempts.data.length)
          : 0,
      };

      // Average progress
      const avgProgress = (enrollments.data || []).length > 0
        ? Math.round((enrollments.data || []).reduce((acc, e) => acc + (e.progress_percent || 0), 0) / enrollments.data.length)
        : 0;

      return {
        totals: {
          users: users.data?.length || 0,
          courses: courses.data?.length || 0,
          enrollments: enrollments.data?.length || 0,
          certificates: certificates.data?.length || 0,
          lessons: lessons.data?.length || 0,
          publishedCourses: courses.data?.filter(c => c.is_published).length || 0,
        },
        monthlyData,
        courseDistribution,
        courseEnrollmentData,
        quizStats,
        avgProgress,
        completedEnrollments: (enrollments.data || []).filter(e => e.completed_at || (e.progress_percent || 0) >= 100).length,
        recentUsers: (users.data || [])
          .filter(u => u.created_at && new Date(u.created_at) >= subDays(now, 30))
          .length,
      };
    },
  });

  const exportReport = (type: string) => {
    if (!stats) return;

    let content = "";
    let filename = "";

    if (type === "overview") {
      const headers = ["Métrica", "Valor"];
      const rows = [
        ["Total de Usuários", stats.totals.users],
        ["Cursos Publicados", stats.totals.publishedCourses],
        ["Total de Matrículas", stats.totals.enrollments],
        ["Certificados Emitidos", stats.totals.certificates],
        ["Cursos Concluídos", stats.completedEnrollments],
        ["Progresso Médio", `${stats.avgProgress}%`],
      ];
      content = [headers, ...rows].map(r => r.join(",")).join("\n");
      filename = "relatorio_geral";
    } else if (type === "courses") {
      const headers = ["Curso", "Matrículas", "Concluídos"];
      const rows = stats.courseEnrollmentData.map(c => [c.fullName, c.enrollments, c.completed]);
      content = [headers, ...rows].map(r => r.join(",")).join("\n");
      filename = "relatorio_cursos";
    } else if (type === "monthly") {
      const headers = ["Mês", "Matrículas", "Certificados", "Novos Usuários"];
      const rows = stats.monthlyData.map(m => [m.month, m.enrollments, m.certificates, m.users]);
      content = [headers, ...rows].map(r => r.join(",")).join("\n");
      filename = "relatorio_mensal";
    }

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${format(new Date(), "dd-MM-yyyy")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Relatórios e Análises
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualize métricas e exporte relatórios do sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Último mês</SelectItem>
                <SelectItem value="3months">3 meses</SelectItem>
                <SelectItem value="6months">6 meses</SelectItem>
                <SelectItem value="1year">1 ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Usuários", value: stats?.totals.users || 0, icon: Users, color: "text-blue-500" },
            { label: "Cursos", value: stats?.totals.publishedCourses || 0, icon: BookOpen, color: "text-emerald-500" },
            { label: "Matrículas", value: stats?.totals.enrollments || 0, icon: GraduationCap, color: "text-violet-500" },
            { label: "Certificados", value: stats?.totals.certificates || 0, icon: Award, color: "text-amber-500" },
            { label: "Aulas", value: stats?.totals.lessons || 0, icon: FileText, color: "text-rose-500" },
            { label: "Progresso", value: `${stats?.avgProgress || 0}%`, icon: TrendingUp, color: "text-teal-500" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="courses">Por Curso</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            </TabsList>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportReport(activeTab)}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Monthly Trends */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Evolução Mensal
                  </CardTitle>
                  <CardDescription>Matrículas e certificados nos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats?.monthlyData || []}>
                        <defs>
                          <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B4C5C" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8B4C5C" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="certGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A029" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#C9A029" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="enrollments"
                          name="Matrículas"
                          stroke="#8B4C5C"
                          fill="url(#enrollmentGradient)"
                        />
                        <Area
                          type="monotone"
                          dataKey="certificates"
                          name="Certificados"
                          stroke="#C9A029"
                          fill="url(#certGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Course Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Cursos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={stats?.courseDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                        >
                          {(stats?.courseDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {(stats?.courseDistribution || []).map((item) => (
                      <Badge key={item.name} variant="outline" className="gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}: {item.value}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-3xl font-bold">{stats?.completedEnrollments || 0}</p>
                    <p className="text-sm text-muted-foreground">Cursos Concluídos</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold">{stats?.recentUsers || 0}</p>
                    <p className="text-sm text-muted-foreground">Novos Usuários (30 dias)</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Award className="w-8 h-8 text-amber-500" />
                    </div>
                    <p className="text-3xl font-bold">{stats?.quizStats.avgScore || 0}%</p>
                    <p className="text-sm text-muted-foreground">Média nos Quizzes</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Matrículas por Curso</CardTitle>
                <CardDescription>Comparativo de matrículas e conclusões</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.courseEnrollmentData?.slice(0, 8) || []}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="enrollments" name="Matrículas" fill="#8B4C5C" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" name="Concluídos" fill="#4A7043" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Curso</TableHead>
                      <TableHead className="text-center">Matrículas</TableHead>
                      <TableHead className="text-center">Concluídos</TableHead>
                      <TableHead className="text-center">Taxa de Conclusão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(stats?.courseEnrollmentData || []).map((course) => (
                      <TableRow key={course.fullName}>
                        <TableCell className="font-medium">{course.fullName}</TableCell>
                        <TableCell className="text-center">{course.enrollments}</TableCell>
                        <TableCell className="text-center">{course.completed}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={course.enrollments > 0 && (course.completed / course.enrollments) >= 0.5 ? "default" : "secondary"}>
                            {course.enrollments > 0 
                              ? Math.round((course.completed / course.enrollments) * 100) 
                              : 0}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{stats?.quizStats.total || 0}</p>
                    <p className="text-sm text-muted-foreground">Total de Tentativas</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-4xl font-bold text-emerald-500">{stats?.quizStats.passed || 0}</p>
                    <p className="text-sm text-muted-foreground">Aprovados</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-4xl font-bold text-amber-500">{stats?.quizStats.avgScore || 0}%</p>
                    <p className="text-sm text-muted-foreground">Nota Média</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Relatórios detalhados de quizzes em desenvolvimento
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
