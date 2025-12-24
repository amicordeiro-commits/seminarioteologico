import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  MessageCircle,
  Heart,
  Share,
  Search,
  Plus,
  TrendingUp,
  Clock,
  BookOpen,
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  Church,
  Send,
} from "lucide-react";
import { useState } from "react";

const discussions = [
  {
    id: 1,
    author: "Pr. Roberto Silva",
    avatar: "RS",
    title: "A importância da Cristologia no estudo teológico",
    content:
      "Gostaria de iniciar uma discussão sobre como a cristologia deve ser o centro de todo estudo teológico. Como vocês entendem a relação entre cristologia e as demais disciplinas teológicas?",
    category: "Teologia Sistemática",
    likes: 24,
    comments: 12,
    time: "2 horas atrás",
    isLiked: true,
  },
  {
    id: 2,
    author: "Maria Santos",
    avatar: "MS",
    title: "Dúvida sobre exegese de Romanos 9",
    content:
      "Estou estudando Romanos 9 e gostaria de ouvir diferentes perspectivas sobre a eleição. Como vocês interpretam este capítulo à luz do contexto histórico-gramatical?",
    category: "Exegese",
    likes: 18,
    comments: 28,
    time: "4 horas atrás",
    isLiked: false,
  },
  {
    id: 3,
    author: "João Pedro",
    avatar: "JP",
    title: "Recursos para estudo de Hebraico",
    content:
      "Alguém pode recomendar materiais complementares para o estudo de hebraico bíblico? Estou procurando especialmente exercícios práticos de tradução.",
    category: "Línguas Bíblicas",
    likes: 15,
    comments: 8,
    time: "1 dia atrás",
    isLiked: true,
  },
  {
    id: 4,
    author: "Ana Clara",
    avatar: "AC",
    title: "Reforma Protestante: impactos atuais",
    content:
      "Iniciando uma reflexão sobre como os princípios da Reforma ainda influenciam a igreja contemporânea. Sola Scriptura ainda é relevante em nossos dias?",
    category: "História da Igreja",
    likes: 32,
    comments: 45,
    time: "2 dias atrás",
    isLiked: false,
  },
];

const popularTopics = [
  { name: "Teologia Reformada", count: 156 },
  { name: "Apologética", count: 98 },
  { name: "Escatologia", count: 87 },
  { name: "Hermenêutica", count: 76 },
  { name: "Missões", count: 65 },
];

const members = [
  { name: "Dr. Paulo Mendes", role: "Professor", avatar: "PM", online: true },
  { name: "Pr. Roberto Silva", role: "Moderador", avatar: "RS", online: true },
  { name: "Maria Santos", role: "Estudante", avatar: "MS", online: false },
  { name: "João Pedro", role: "Estudante", avatar: "JP", online: true },
];

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newPost, setNewPost] = useState("");

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
              Comunidade Teológica
            </h1>
            <p className="text-muted-foreground">
              Conecte-se com outros estudantes e professores
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Discussão
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* New Post */}
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    SO
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Compartilhe uma reflexão ou inicie uma discussão teológica..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                        Teologia
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                        Exegese
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                        + Categoria
                      </Badge>
                    </div>
                    <Button size="sm" className="gap-2">
                      <Send className="w-4 h-4" />
                      Publicar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar discussões..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Discussions */}
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all"
                >
                  <div className="flex gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {discussion.avatar}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-serif font-semibold text-lg text-foreground hover:text-primary cursor-pointer transition-colors">
                            {discussion.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {discussion.author}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {discussion.time}
                            </span>
                          </div>
                        </div>
                        <button className="text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {discussion.content}
                      </p>

                      <Badge variant="outline" className="bg-primary/5">
                        {discussion.category}
                      </Badge>

                      <div className="flex items-center gap-6 pt-2">
                        <button
                          className={`flex items-center gap-2 text-sm transition-colors ${
                            discussion.isLiked
                              ? "text-primary"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              discussion.isLiked ? "fill-current" : ""
                            }`}
                          />
                          {discussion.likes}
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          {discussion.comments} respostas
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Share className="w-4 h-4" />
                          Compartilhar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Estatísticas
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Membros</span>
                  <span className="font-semibold text-foreground">1,248</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Discussões</span>
                  <span className="font-semibold text-foreground">3,456</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Respostas</span>
                  <span className="font-semibold text-foreground">12,890</span>
                </div>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Tópicos em Alta
              </h3>
              <div className="space-y-2">
                {popularTopics.map((topic, index) => (
                  <button
                    key={topic.name}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-foreground">{topic.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {topic.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Online Members */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
                <Church className="w-5 h-5 text-primary" />
                Membros Online
              </h3>
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {member.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
