import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  GraduationCap,
  Calendar,
  MessageSquare,
  Library,
  ClipboardList,
  PlayCircle,
  Languages,
  FileDown,
  Award,
  BarChart3,
  Newspaper,
  HelpCircle,
  DollarSign,
  UserPlus,
  Menu,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Usuários", path: "/admin/users" },
  { icon: UserPlus, label: "Admissões", path: "/admin/admissions" },
  { icon: GraduationCap, label: "Matrículas", path: "/admin/enrollments" },
  { icon: BookOpen, label: "Cursos", path: "/admin/courses" },
  { icon: PlayCircle, label: "Aulas", path: "/admin/lessons" },
  { icon: ClipboardList, label: "Quizzes", path: "/admin/quizzes" },
  { icon: Award, label: "Certificados", path: "/admin/certificates" },
  { icon: BarChart3, label: "Histórico", path: "/admin/transcripts" },
  { icon: DollarSign, label: "Financeiro", path: "/admin/finance" },
  { icon: Library, label: "Biblioteca", path: "/admin/library" },
  { icon: Calendar, label: "Eventos", path: "/admin/events" },
  { icon: FileText, label: "Devocionais", path: "/admin/devotionals" },
  { icon: Newspaper, label: "Blog", path: "/admin/blog" },
  { icon: MessageSquare, label: "Fórum", path: "/admin/forum" },
  { icon: Languages, label: "Strong's PT", path: "/admin/strongs" },
  { icon: FileDown, label: "Materiais PDF", path: "/admin/materials" },
  { icon: BarChart3, label: "Relatórios", path: "/admin/reports" },
  { icon: HelpCircle, label: "Manual", path: "/admin/manual" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-foreground">Admin</h1>
            <p className="text-xs text-muted-foreground">Painel de Controle</p>
          </div>
        </div>
      </div>

      {/* Back to Portal */}
      <div className="p-3 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => {
            navigate("/");
            onNavigate?.();
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar ao Portal
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-muted-foreground truncate max-w-[140px]">
            {user?.email}
          </span>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-serif font-bold text-foreground">Admin</span>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 flex flex-col">
            <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
