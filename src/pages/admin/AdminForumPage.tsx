import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Pin, Lock, Eye, MessageCircle } from "lucide-react";
import { useForumTopics } from "@/hooks/useForum";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminForumPage() {
  const { data: topics = [], isLoading } = useForumTopics();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            Fórum
          </h1>
          <p className="text-muted-foreground">Gerencie as discussões do fórum</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Tópicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topics.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Fixados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topics.filter(t => t.is_pinned).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topics.filter(t => t.is_locked).length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            {topics.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum tópico no fórum</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tópico</TableHead>
                    <TableHead>Respostas</TableHead>
                    <TableHead>Visualizações</TableHead>
                    <TableHead>Última Atividade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics.map(topic => (
                    <TableRow key={topic.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {topic.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                          {topic.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                          <span className="font-medium">{topic.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {topic.replies_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {topic.views_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        {topic.last_reply_at
                          ? format(new Date(topic.last_reply_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : format(new Date(topic.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {topic.is_pinned && <Badge variant="secondary">Fixado</Badge>}
                          {topic.is_locked && <Badge variant="outline">Bloqueado</Badge>}
                          {!topic.is_pinned && !topic.is_locked && <Badge variant="outline">Aberto</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
