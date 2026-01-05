import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  BellRing,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useTheme } from "@/hooks/useTheme";
import { requestPushPermission } from "@/hooks/useNotifications";

export default function SettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } = useUserSettings();
  const { theme, setTheme } = useTheme();
  
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Local state for notifications (synced with settings)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newCourse: true,
    messages: true,
    reminders: false,
    weeklyDigest: true,
  });

  // Sync local state with settings when loaded
  useEffect(() => {
    if (settings) {
      setNotifications({
        email: settings.email_notifications,
        push: settings.push_notifications,
        newCourse: settings.new_course_notifications,
        messages: settings.message_notifications,
        reminders: settings.reminder_notifications,
        weeklyDigest: settings.weekly_digest,
      });
    }
  }, [settings]);

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos de senha");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast.success("Senha atualizada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar senha");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
    // If enabling push notifications, request permission first
    if (key === 'push' && value) {
      const granted = await requestPushPermission();
      if (!granted) {
        toast.error("Permissão de notificações negada. Habilite nas configurações do navegador.");
        return;
      }
      toast.success("Notificações do navegador habilitadas!");
    }

    setNotifications(prev => ({ ...prev, [key]: value }));
    
    const fieldMap: Record<string, string> = {
      email: "email_notifications",
      push: "push_notifications",
      newCourse: "new_course_notifications",
      messages: "message_notifications",
      reminders: "reminder_notifications",
      weeklyDigest: "weekly_digest",
    };
    
    try {
      await updateSettings({ [fieldMap[key]]: value });
    } catch (error) {
      toast.error("Erro ao salvar configuração");
      setNotifications(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'system');
    try {
      await updateSettings({ theme: newTheme });
      toast.success("Tema atualizado!");
    } catch (error) {
      toast.error("Erro ao salvar tema");
    }
  };

  const handleFontSizeChange = async (size: string) => {
    try {
      await updateSettings({ font_size: size });
      toast.success("Tamanho da fonte atualizado!");
    } catch (error) {
      toast.error("Erro ao salvar configuração");
    }
  };

  const handleLanguageChange = async (language: string) => {
    try {
      await updateSettings({ language });
      toast.success("Idioma atualizado!");
    } catch (error) {
      toast.error("Erro ao salvar configuração");
    }
  };

  const handleTimezoneChange = async (timezone: string) => {
    try {
      await updateSettings({ timezone });
      toast.success("Fuso horário atualizado!");
    } catch (error) {
      toast.error("Erro ao salvar configuração");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações de conta
          </p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="bg-card border border-border flex-wrap h-auto p-1 gap-1">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="language" className="gap-2">
              <Globe className="w-4 h-4" />
              Idioma
            </TabsTrigger>
          </TabsList>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h3 className="text-lg font-serif font-semibold text-foreground">
                Preferências de Notificação
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-foreground font-medium">
                        Notificações por Email
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receba atualizações importantes no seu email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-foreground font-medium">
                        Notificações Push
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações no navegador
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <h4 className="font-medium text-foreground">Tipos de Notificação</h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground">Novos cursos</Label>
                      <Switch
                        checked={notifications.newCourse}
                        onCheckedChange={(checked) => handleNotificationChange("newCourse", checked)}
                        disabled={isUpdating}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground">Mensagens</Label>
                      <Switch
                        checked={notifications.messages}
                        onCheckedChange={(checked) => handleNotificationChange("messages", checked)}
                        disabled={isUpdating}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground">
                        Lembretes de estudo
                      </Label>
                      <Switch
                        checked={notifications.reminders}
                        onCheckedChange={(checked) => handleNotificationChange("reminders", checked)}
                        disabled={isUpdating}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground">
                        Resumo semanal
                      </Label>
                      <Switch
                        checked={notifications.weeklyDigest}
                        onCheckedChange={(checked) => handleNotificationChange("weeklyDigest", checked)}
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h3 className="text-lg font-serif font-semibold text-foreground">
                Aparência
              </h3>

              <div className="space-y-6">
                <div>
                  <Label className="text-foreground font-medium mb-3 block">
                    Tema
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    <button 
                      onClick={() => handleThemeChange("light")}
                      className={`p-4 rounded-xl border-2 bg-card hover:border-primary/80 transition-all ${
                        (settings?.theme || theme) === "light" ? "border-primary" : "border-border"
                      }`}
                    >
                      <div className="w-full h-20 rounded-lg bg-background mb-3 flex items-center justify-center">
                        <Sun className="w-8 h-8 text-accent" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Claro</p>
                    </button>
                    <button 
                      onClick={() => handleThemeChange("dark")}
                      className={`p-4 rounded-xl border-2 bg-card hover:border-primary/80 transition-all ${
                        (settings?.theme || theme) === "dark" ? "border-primary" : "border-border"
                      }`}
                    >
                      <div className="w-full h-20 rounded-lg bg-foreground mb-3 flex items-center justify-center">
                        <Moon className="w-8 h-8 text-background" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Escuro</p>
                    </button>
                    <button 
                      onClick={() => handleThemeChange("system")}
                      className={`p-4 rounded-xl border-2 bg-card hover:border-primary/80 transition-all ${
                        (settings?.theme || theme) === "system" ? "border-primary" : "border-border"
                      }`}
                    >
                      <div className="w-full h-20 rounded-lg bg-gradient-to-b from-background to-foreground mb-3 flex items-center justify-center">
                        <Settings className="w-8 h-8 text-muted" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Sistema</p>
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-foreground font-medium mb-3 block">
                    Tamanho da Fonte
                  </Label>
                  <Select 
                    value={settings?.font_size || "medium"} 
                    onValueChange={handleFontSizeChange}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Selecione o tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h3 className="text-lg font-serif font-semibold text-foreground">
                Segurança da Conta
              </h3>

              <div className="space-y-6">
                <div>
                  <Label className="text-foreground font-medium mb-2 block">
                    Alterar Senha
                  </Label>
                  <div className="space-y-3 max-w-md">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Senha atual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <Input 
                      type="password" 
                      placeholder="Nova senha" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input 
                      type="password" 
                      placeholder="Confirmar nova senha" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button 
                      className="gap-2" 
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                    >
                      <Key className="w-4 h-4" />
                      {isUpdatingPassword ? "Atualizando..." : "Atualizar Senha"}
                    </Button>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <Label className="text-foreground font-medium">
                          Autenticação de Dois Fatores
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Adicione uma camada extra de segurança
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Configurar</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Language */}
          <TabsContent value="language" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h3 className="text-lg font-serif font-semibold text-foreground">
                Idioma e Região
              </h3>

              <div className="space-y-6 max-w-md">
                <div>
                  <Label className="text-foreground font-medium mb-2 block">
                    Idioma
                  </Label>
                  <Select 
                    value={settings?.language || "pt-BR"} 
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-foreground font-medium mb-2 block">
                    Fuso Horário
                  </Label>
                  <Select 
                    value={settings?.timezone || "america-sao_paulo"} 
                    onValueChange={handleTimezoneChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-sao_paulo">
                        São Paulo (GMT-3)
                      </SelectItem>
                      <SelectItem value="america-manaus">
                        Manaus (GMT-4)
                      </SelectItem>
                      <SelectItem value="america-fortaleza">
                        Fortaleza (GMT-3)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
