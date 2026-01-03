import { Bell, User, LogOut, Settings, Award, Shield, Check, Trash2 } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
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
    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta.",
    });
    window.location.href = "/auth";
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 z-50">
              <div className="flex items-center justify-between px-3 py-2">
                <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => markAllAsRead()}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Marcar todas
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Nenhuma notificação
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                        !notification.is_read ? 'bg-muted/30' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

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
