import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Edit,
  Camera,
  Church,
  GraduationCap,
  Clock,
  Target,
  Heart,
  Save,
} from "lucide-react";
import { useState } from "react";

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
    unlocked: true,
    date: "10 Fev 2024",
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

const certificates = [
  {
    id: 1,
    title: "Introdução à Teologia Sistemática",
    issueDate: "15 Mar 2024",
    instructor: "Dr. Paulo Mendes",
    hours: 40,
  },
  {
    id: 2,
    title: "História da Igreja Primitiva",
    issueDate: "28 Fev 2024",
    instructor: "Pr. Roberto Silva",
    hours: 32,
  },
  {
    id: 3,
    title: "Hermenêutica Bíblica",
    issueDate: "10 Jan 2024",
    instructor: "Dr. Maria Santos",
    hours: 24,
  },
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Samuel Oliveira",
    email: "samuel.oliveira@email.com",
    phone: "(11) 98765-4321",
    location: "São Paulo, SP",
    church: "Igreja Presbiteriana Central",
    ministry: "Professor de Escola Dominical",
    bio: "Estudante de teologia apaixonado pela Palavra de Deus. Buscando aprofundar conhecimento para melhor servir à igreja local.",
    joinDate: "Janeiro 2024",
  });

  const stats = {
    coursesCompleted: 5,
    coursesInProgress: 3,
    totalHours: 124,
    certificates: 3,
  };

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
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <User className="w-16 h-16 lg:w-20 lg:h-20 text-primary" />
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Name and Actions */}
              <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">
                    {profile.name}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Church className="w-4 h-4" />
                    {profile.church}
                  </p>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "default" : "outline"}
                  className="gap-2"
                >
                  {isEditing ? (
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
            <TabsTrigger value="certificates">Certificados</TabsTrigger>
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
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    {isEditing ? (
                      <Input
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-foreground">{profile.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefone
                    </label>
                    {isEditing ? (
                      <Input
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-foreground">{profile.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Localização
                    </label>
                    {isEditing ? (
                      <Input
                        value={profile.location}
                        onChange={(e) =>
                          setProfile({ ...profile, location: e.target.value })
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-foreground">{profile.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ministry Info */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                  <Church className="w-5 h-5 text-primary" />
                  Informações Ministeriais
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Igreja</label>
                    {isEditing ? (
                      <Input
                        value={profile.church}
                        onChange={(e) =>
                          setProfile({ ...profile, church: e.target.value })
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-foreground">{profile.church}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Ministério</label>
                    {isEditing ? (
                      <Input
                        value={profile.ministry}
                        onChange={(e) =>
                          setProfile({ ...profile, ministry: e.target.value })
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-foreground">{profile.ministry}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Membro desde
                    </label>
                    <p className="text-foreground">{profile.joinDate}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Sobre mim
                    </label>
                    {isEditing ? (
                      <Textarea
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        className="mt-1"
                        rows={4}
                      />
                    ) : (
                      <p className="text-foreground text-sm">{profile.bio}</p>
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

          {/* Certificates Tab */}
          <TabsContent value="certificates">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-serif font-semibold text-foreground mb-6">
                Meus Certificados
              </h3>

              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Award className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-serif font-semibold text-foreground">
                          {cert.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Instrutor: {cert.instructor}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {cert.issueDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {cert.hours} horas
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Certificado
                      </Button>
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
