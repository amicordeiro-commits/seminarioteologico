import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus, MessageCircle, Eye, ArrowLeft, Send, Pin, Lock, Search, Loader2, User } from "lucide-react";
import { useForumTopics, useCreateTopic, useForumReplies, useCreateReply } from "@/hooks/useForum";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

function TopicDetail({ topicId, topic, onBack }: { topicId: string; topic: any; onBack: () => void }) {
  const { data: replies = [], isLoading } = useForumReplies(topicId);
  const createReply = useCreateReply();
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    try {
      await createReply.mutateAsync({ topicId, content: replyContent });
      toast.success("Resposta enviada!");
      setReplyContent("");
    } catch {
      toast.error("Erro ao enviar resposta");
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Voltar ao Fórum
      </Button>

      {/* Topic */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-foreground">{topic.title}</h2>
                {topic.is_pinned && <Badge variant="secondary" className="gap-1 text-xs"><Pin className="w-3 h-3" />Fixado</Badge>}
                {topic.is_locked && <Badge variant="outline" className="gap-1 text-xs"><Lock className="w-3 h-3" />Fechado</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {format(new Date(topic.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
              <div className="text-sm sm:text-base text-foreground/90 whitespace-pre-line leading-relaxed">
                {topic.content}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-3">
        <h3 className="font-serif font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
          <MessageCircle className="w-4 h-4 text-primary" />
          {replies.length} {replies.length === 1 ? "Resposta" : "Respostas"}
        </h3>

        {isLoading ? (
          <Skeleton className="h-32" />
        ) : replies.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma resposta ainda. Seja o primeiro!</p>
            </CardContent>
          </Card>
        ) : (
          replies.map((reply, index) => (
            <Card key={reply.id} className={cn("transition-all", reply.is_solution && "border-green-500/30 bg-green-500/5")}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(reply.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      {reply.is_solution && <Badge className="bg-green-500/10 text-green-600 text-xs">✓ Solução</Badge>}
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-line">{reply.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Form */}
      {!topic.is_locked && user && (
        <Card>
          <CardContent className="p-4">
            <Textarea
              placeholder="Escreva sua resposta..."
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              rows={3}
              className="mb-3"
            />
            <div className="flex justify-end">
              <Button onClick={handleReply} disabled={!replyContent.trim() || createReply.isPending} className="gap-2">
                {createReply.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Responder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ForumPage() {
  const { data: topics = [], isLoading } = useForumTopics();
  const createTopic = useCreateTopic();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      await createTopic.mutateAsync({ title, content });
      toast.success("Tópico criado!");
      setIsOpen(false);
      setTitle("");
      setContent("");
    } catch {
      toast.error("Erro ao criar tópico");
    }
  };

  const filteredTopics = topics.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <AppLayout><div className="space-y-4"><Skeleton className="h-16" /><Skeleton className="h-96" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {selectedTopic ? (
          <TopicDetail
            topicId={selectedTopic.id}
            topic={selectedTopic}
            onBack={() => setSelectedTopic(null)}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  Fórum de Discussão
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {topics.length} {topics.length === 1 ? "tópico" : "tópicos"} • Compartilhe e aprenda com a comunidade
                </p>
              </div>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Tópico</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Tópico</DialogTitle>
                    <DialogDescription>Crie um novo tópico de discussão para a comunidade.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Título do tópico" value={title} onChange={e => setTitle(e.target.value)} />
                    <Textarea placeholder="Conteúdo..." value={content} onChange={e => setContent(e.target.value)} rows={5} />
                    <Button onClick={handleCreate} disabled={!title || !content || createTopic.isPending} className="w-full gap-2">
                      {createTopic.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Criar Tópico
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tópicos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            {/* Topics List */}
            {filteredTopics.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-serif font-semibold text-foreground mb-1">Nenhum tópico encontrado</h3>
                  <p className="text-sm text-muted-foreground">Seja o primeiro a criar um tópico!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredTopics.map(topic => (
                  <Card
                    key={topic.id}
                    className={cn(
                      "hover:shadow-md transition-all cursor-pointer group",
                      topic.is_pinned && "border-primary/30 bg-primary/5"
                    )}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {topic.title}
                            </h3>
                            {topic.is_pinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
                            {topic.is_locked && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">{topic.content}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{format(new Date(topic.created_at), "dd MMM yyyy", { locale: ptBR })}</span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />{topic.replies_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />{topic.views_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
