import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus, MessageCircle, Eye } from "lucide-react";
import { useForumTopics, useCreateTopic } from "@/hooks/useForum";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function ForumPage() {
  const { data: topics = [], isLoading } = useForumTopics();
  const createTopic = useCreateTopic();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      await createTopic.mutateAsync({ title, content });
      toast.success("Tópico criado!");
      setIsOpen(false);
      setTitle("");
      setContent("");
    } catch (e) {
      toast.error("Erro ao criar tópico");
    }
  };

  if (isLoading) {
    return <AppLayout><div className="p-6"><Skeleton className="h-96" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            Fórum
          </h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Novo Tópico</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Tópico</DialogTitle>
                <DialogDescription>Crie um novo tópico de discussão para a comunidade.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Título do tópico" value={title} onChange={e => setTitle(e.target.value)} />
                <Textarea placeholder="Conteúdo..." value={content} onChange={e => setContent(e.target.value)} rows={5} />
                <Button onClick={handleCreate} disabled={!title || !content} className="w-full">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {topics.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p>Nenhum tópico ainda. Seja o primeiro!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {topics.map(topic => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{topic.content}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{topic.replies_count}</span>
                      <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{topic.views_count}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(topic.created_at), "dd MMM yyyy", { locale: ptBR })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
