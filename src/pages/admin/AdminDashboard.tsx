import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Calendar,
  Library,
  ArrowUpRight,
  ArrowRight,
  Activity,
  Clock,
  Award,
  FileText,
  Bell,
  BarChart3,
  PieChart,
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from "recharts";

// Mock data for charts
const enrollmentData = [
  { month: "Jan", enrollments: 45 },
  { month: "Fev", enrollments: 52 },
  { month: "Mar", enrollments: 61 },
  { month: "Abr", enrollments: 58 },
  { month: "Mai", enrollments: 73 },
  { month: "Jun", enrollments: 89 },
];

const courseDistribution = [
  { name: "Teologia", value: 35, color: "hsl(345, 45%, 28%)" },
  { name: "História", value: 25, color: "hsl(42, 80%, 50%)" },
  { name: "Bíblia", value: 30, color: "hsl(85, 40%, 40%)" },
  { name: "Outros", value: 10, color: "hsl(20, 20%, 50%)" },
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
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
    { 
      title: "Total de Usuários", 
      value: stats?.users || 0, 
      icon: Users, 
      trend: "+12%",
      trendUp: true,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      link: "/admin/users"
    },
    { 
      title: "Cursos Ativos", 
      value: stats?.courses || 0, 
      icon: BookOpen, 
      trend: "+3",
      trendUp: true,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      link: "/admin/courses"
    },
    { 
      title: "Matrículas", 
      value: stats?.enrollments || 0, 
      icon: TrendingUp, 
      trend: "+28%",
      trendUp: true,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-500/10",
      link: "/admin/users"
    },
    { 
      title: "Certificados", 
      value: stats?.certificates || 0, 
      icon: GraduationCap, 
      trend: "+15",
      trendUp: true,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500/10",
      link: "/admin/certificates"
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo ao painel de controle do Seminário Teológico
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="w-4 h-4" />
              Notificações
            </Button>
            <Button size="sm" className="gap-2 gradient-accent text-accent-foreground">
              <Zap className="w-4 h-4" />
              Ação Rápida
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Link key={stat.title} to={stat.link}>
              <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-transparent hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                          {stat.trend}
                        </span>
                        <span className="text-xs text-muted-foreground">vs mês anterior</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Enrollment Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Matrículas por Mês
                  </CardTitle>
                  <CardDescription>Evolução das matrículas nos últimos 6 meses</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  Ver detalhes
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrollmentData}>
                    <defs>
                      <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(345, 45%, 28%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(345, 45%, 28%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(20, 15%, 45%)' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(20, 15%, 45%)' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="enrollments"
                      stroke="hsl(345, 45%, 28%)"
                      strokeWidth={2}
                      fill="url(#enrollmentGradient)"
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
              <CardDescription>Distribuição de cursos ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={courseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {courseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {courseDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Novo Curso", icon: BookOpen, href: "/admin/courses", color: "bg-emerald-500" },
                { label: "Adicionar Usuário", icon: Users, href: "/admin/users", color: "bg-blue-500" },
                { label: "Novo Evento", icon: Calendar, href: "/admin/events", color: "bg-violet-500" },
                { label: "Upload Material", icon: Library, href: "/admin/library", color: "bg-amber-500" },
              ].map((action) => (
                <Link key={action.label} to={action.href}>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group cursor-pointer">
                    <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-sm">{action.label}</span>
                    <ArrowUpRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Atividades Recentes
                </CardTitle>
                <Button variant="ghost" size="sm">Ver todas</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    title: "Nova matrícula no curso de Teologia Sistemática",
                    time: "Há 5 minutos",
                    icon: GraduationCap,
                    color: "bg-emerald-500"
                  },
                  { 
                    title: "Certificado emitido para João Silva",
                    time: "Há 2 horas",
                    icon: Award,
                    color: "bg-amber-500"
                  },
                  { 
                    title: "Novo material adicionado à biblioteca",
                    time: "Há 4 horas",
                    icon: FileText,
                    color: "bg-blue-500"
                  },
                  { 
                    title: "Evento 'Semana de Oração' criado",
                    time: "Ontem",
                    icon: Calendar,
                    color: "bg-violet-500"
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full ${activity.color} flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle>Metas do Mês</CardTitle>
            <CardDescription>Acompanhe o progresso das metas estabelecidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: "Novas Matrículas", current: 73, target: 100, color: "bg-primary" },
                { label: "Cursos Publicados", current: 8, target: 10, color: "bg-emerald-500" },
                { label: "Certificados Emitidos", current: 45, target: 50, color: "bg-amber-500" },
              ].map((goal) => (
                <div key={goal.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{goal.label}</span>
                    <span className="text-sm text-muted-foreground">{goal.current}/{goal.target}</span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
