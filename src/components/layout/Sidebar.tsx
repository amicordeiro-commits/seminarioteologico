import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Calendar,
  MessageSquare,
  Settings,
  BarChart3,
  Users,
  Search,
  Menu,
  X,
  BookMarked,
  Church,
  Library,
  User,
  Award,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: BookOpen, label: "Meus Cursos", path: "/courses" },
  { icon: Library, label: "Bíblia de Estudo", path: "/bible" },
  { icon: BookMarked, label: "Devocional", path: "/devotional" },
  { icon: Calendar, label: "Calendário", path: "/calendar" },
  { icon: MessageSquare, label: "Mensagens", path: "/messages" },
  { icon: BarChart3, label: "Meu Progresso", path: "/progress" },
  { icon: Award, label: "Certificados", path: "/certificates" },
  { icon: Users, label: "Comunidade", path: "/community" },
  { icon: User, label: "Meu Perfil", path: "/profile" },
];

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-sidebar text-sidebar-foreground"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar text-sidebar-foreground z-40 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-glow">
              <Church className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-serif font-bold text-xl text-sidebar-foreground">Seminário</span>
                <p className="text-xs text-sidebar-foreground/60 font-sans">Teológico</p>
              </div>
            )}
          </Link>
        </div>

        {/* Daily Verse */}
        {!isCollapsed && (
          <div className="p-4 mx-4 mt-4 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
            <div className="flex items-center gap-2 mb-2">
              <BookMarked className="w-4 h-4 text-sidebar-primary" />
              <span className="text-xs font-medium text-sidebar-primary">Versículo do Dia</span>
            </div>
            <p className="text-xs text-sidebar-foreground/80 italic leading-relaxed">
              "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho."
            </p>
            <p className="text-xs text-sidebar-foreground/60 mt-1 font-medium">Salmos 119:105</p>
          </div>
        )}

        {/* Search */}
        {!isCollapsed && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-foreground/50" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-sidebar-accent text-sidebar-foreground placeholder:text-sidebar-foreground/50 border border-sidebar-border focus:outline-none focus:ring-2 focus:ring-sidebar-primary text-sm font-sans"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-sans",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70"
                  )}
                />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors font-sans"
          >
            <Settings className="w-5 h-5 text-sidebar-foreground/70" />
            {!isCollapsed && <span className="font-medium">Configurações</span>}
          </Link>
        </div>

        {/* Collapse Toggle (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-primary text-sidebar-primary-foreground items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </aside>
    </>
  );
}
