import { Bell, User, LogOut, Settings, Award, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  isSidebarCollapsed?: boolean;
}

// Map routes to page titles
const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
  const routes: Record<string, { title: string; subtitle: string }> = {
    '/': { title: 'Portal do Aluno', subtitle: 'Seminário Teológico' },
    '/courses': { title: 'Cursos', subtitle: 'Explore nossos cursos' },
    '/bible': { title: 'Bíblia de Estudo', subtitle: 'ESV com comentários' },
    '/devotional': { title: 'Devocional', subtitle: 'Leitura diária' },
    '/library': { title: 'Biblioteca', subtitle: 'Materiais de estudo' },
    '/calendar': { title: 'Calendário', subtitle: 'Eventos e atividades' },
    '/progress': { title: 'Progresso', subtitle: 'Sua jornada' },
    '/certificates': { title: 'Certificados', subtitle: 'Suas conquistas' },
    '/profile': { title: 'Perfil', subtitle: 'Suas informações' },
    '/settings': { title: 'Configurações', subtitle: 'Preferências' },
    '/messages': { title: 'Mensagens', subtitle: 'Comunicação' },
    '/community': { title: 'Comunidade', subtitle: 'Fórum de discussão' },
    '/forum': { title: 'Fórum', subtitle: 'Discussões teológicas' },
    '/finance': { title: 'Financeiro', subtitle: 'Pagamentos' },
    '/transcript': { title: 'Histórico', subtitle: 'Acadêmico' },
    '/blog': { title: 'Blog', subtitle: 'Artigos e reflexões' },
  };

  // Check for course detail page
  if (pathname.startsWith('/course/')) {
    return { title: 'Detalhes do Curso', subtitle: 'Aulas e conteúdo' };
  }

  return routes[pathname] || { title: 'Portal do Aluno', subtitle: 'Seminário Teológico' };
};

export function Header({ isSidebarCollapsed }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { title, subtitle } = getPageTitle(location.pathname);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
    // Always show toast and navigate, even if signOut had issues
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta.",
    });
    // Force navigation to auth page
    window.location.href = "/auth";
  };

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Aluno';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6">
        {/* Page Title - Dynamic based on route */}
        <div className="lg:ml-0 ml-12">
          <h1 className="text-base sm:text-xl font-serif font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">{title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans hidden xs:block">{subtitle}</p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 px-1 sm:pl-2 sm:pr-4 h-8 sm:h-10">
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium font-sans">{userName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 z-50">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/certificates')}>
                <Award className="mr-2 h-4 w-4" />
                Certificados
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin')} className="text-primary">
                    <Shield className="mr-2 h-4 w-4" />
                    Painel Admin
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
