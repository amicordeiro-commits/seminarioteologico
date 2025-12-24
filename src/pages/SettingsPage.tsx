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
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newCourse: true,
    messages: true,
    reminders: false,
    weeklyDigest: true,
  });

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
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
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
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <h4 className="font-medium text-foreground">Tipos de Notificação</h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground">Novos cursos</Label>
                      <Switch
                        checked={notifications.newCourse}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, newCourse: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground">Mensagens</Label>
                      <Switch
                        checked={notifications.messages}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, messages: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground">
                        Lembretes de estudo
                      </Label>
                      <Switch
                        checked={notifications.reminders}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, reminders: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground">
                        Resumo semanal
                      </Label>
                      <Switch
                        checked={notifications.weeklyDigest}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, weeklyDigest: checked })
                        }
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
                    <button className="p-4 rounded-xl border-2 border-primary bg-card hover:border-primary/80 transition-all">
                      <div className="w-full h-20 rounded-lg bg-background mb-3 flex items-center justify-center">
                        <Sun className="w-8 h-8 text-accent" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Claro</p>
                    </button>
                    <button className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
                      <div className="w-full h-20 rounded-lg bg-foreground mb-3 flex items-center justify-center">
                        <Moon className="w-8 h-8 text-background" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Escuro</p>
                    </button>
                    <button className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all">
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
                  <Select defaultValue="medium">
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
                    <Input type="password" placeholder="Nova senha" />
                    <Input type="password" placeholder="Confirmar nova senha" />
                    <Button className="gap-2">
                      <Key className="w-4 h-4" />
                      Atualizar Senha
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
                  <Select defaultValue="pt-BR">
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
                  <Select defaultValue="america-sao_paulo">
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

                <Button className="gap-2">
                  <Save className="w-4 h-4" />
                  Salvar Preferências
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
