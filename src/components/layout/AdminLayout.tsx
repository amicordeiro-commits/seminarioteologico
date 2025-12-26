import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
  Upload,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Usuários", path: "/admin/users" },
  { icon: BookOpen, label: "Cursos", path: "/admin/courses" },
  { icon: PlayCircle, label: "Aulas", path: "/admin/lessons" },
  { icon: ClipboardList, label: "Quizzes", path: "/admin/quizzes" },
  { icon: Library, label: "Biblioteca", path: "/admin/library" },
  { icon: Calendar, label: "Eventos", path: "/admin/events" },
  { icon: FileText, label: "Devocionais", path: "/admin/devotionals" },
  { icon: MessageSquare, label: "Mensagens", path: "/admin/messages" },
  { icon: GraduationCap, label: "Certificados", path: "/admin/certificates" },
  { icon: Upload, label: "Importar Estudos", path: "/admin/import-studies" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
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
            onClick={() => navigate("/")}
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
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs text-muted-foreground truncate">
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
