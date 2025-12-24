import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  Edit,
  Camera,
  GraduationCap,
  Clock,
  Target,
  Heart,
  Save,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const achievements = [
  {
    id: 1,
    title: "Primeiro Passo",
    description: "Completou o primeiro módulo",
    icon: "🎯",
    unlocked: true,
    date: "15 Jan 2024",
  },
  {
    id: 2,
    title: "Estudante Dedicado",
    description: "7 dias consecutivos de estudo",
    icon: "📖",
    unlocked: true,
    date: "22 Jan 2024",
  },
  {
    id: 3,
    title: "Buscador da Verdade",
    description: "Completou 5 cursos",
    icon: "✝️",
    unlocked: false,
    date: null,
  },
  {
    id: 4,
    title: "Mestre em Hebraico",
    description: "Concluiu o curso de Hebraico Bíblico",
    icon: "📜",
    unlocked: false,
    date: null,
  },
  {
    id: 5,
    title: "Teólogo",
    description: "Completou 10 cursos",
    icon: "🎓",
    unlocked: false,
    date: null,
  },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating, stats } = useProfile();
  const { uploadAvatar, uploading } = useAvatarUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    try {
      await uploadAvatar(file);
      toast.success("Foto atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar foto");
    }
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
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

  const memberSince = profile?.created_at 
    ? format(new Date(profile.created_at), "MMMM 'de' yyyy", { locale: ptBR })
    : "Janeiro 2024";

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Cover */}
          <div className="h-32 lg:h-48 bg-gradient-to-r from-primary via-primary/80 to-accent relative">
            <div className="absolute inset-0 pattern-cross opacity-10" />
          </div>

          {/* Profile Info */}
          <div className="px-6 lg:px-8 pb-6">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4 -mt-16 lg:-mt-20">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl bg-background border-4 border-background shadow-xl overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <User className="w-16 h-16 lg:w-20 lg:h-20 text-primary" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
              </div>

              {/* Name and Actions */}
              <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">
                    {profile?.full_name || "Estudante"}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>
                </div>
                <Button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  variant={isEditing ? "default" : "outline"}
                  className="gap-2"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      Editar Perfil
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-background rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.coursesCompleted}
                    </p>
                    <p className="text-xs text-muted-foreground">Concluídos</p>
                  </div>
                </div>
              </div>
              <div className="bg-background rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.coursesInProgress}
                    </p>
                    <p className="text-xs text-muted-foreground">Em Progresso</p>
                  </div>
                </div>
              </div>
              <div className="bg-background rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalHours}h
                    </p>
                    <p className="text-xs text-muted-foreground">Estudadas</p>
                  </div>
                </div>
              </div>
              <div className="bg-background rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.certificates}
                    </p>
                    <p className="text-xs text-muted-foreground">Certificados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Informações Pessoais
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Nome Completo</label>
                    {isEditing ? (
                      <Input
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile?.full_name || "Não informado"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="text-foreground">{user?.email}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefone
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="mt-1"
                        placeholder="(00) 00000-0000"
                      />
                    ) : (
                      <p className="text-foreground">{profile?.phone || "Não informado"}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Membro desde
                    </label>
                    <p className="text-foreground">{memberSince}</p>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Sobre Mim
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Tipo de Curso
                    </label>
                    <p className="text-foreground capitalize">{profile?.course_type || "Bacharel"}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Biografia</label>
                    {isEditing ? (
                      <Textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        className="mt-1"
                        rows={4}
                        placeholder="Conte um pouco sobre você..."
                      />
                    ) : (
                      <p className="text-foreground text-sm">
                        {profile?.bio || "Nenhuma biografia informada."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif font-semibold text-foreground">
                  Conquistas Espirituais
                </h3>
                <Badge variant="outline" className="gap-1">
                  <Target className="w-3 h-3" />
                  {achievements.filter((a) => a.unlocked).length}/
                  {achievements.length}
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border transition-all ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20"
                        : "bg-muted/30 border-border opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          achievement.unlocked
                            ? "bg-primary/10"
                            : "bg-muted grayscale"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && (
                          <p className="text-xs text-primary mt-2">
                            Conquistado em {achievement.date}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
