import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Calendar, User, ArrowRight } from "lucide-react";
import { useBlogPosts, BlogPost } from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BlogPage() {
  const { data: posts = [], isLoading } = useBlogPosts(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 px-4">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Blog & Devocionais
          </h1>
          <p className="text-muted-foreground mt-2">
            Reflexões, estudos e mensagens para edificação espiritual
          </p>
        </div>

        {posts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-medium mb-2">
                Nenhum post disponível
              </h3>
              <p className="text-muted-foreground">
                Em breve teremos novos conteúdos para você!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
                onClick={() => setSelectedPost(post)}
              >
                {post.featured_image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {post.excerpt && (
                    <p className="text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {post.author_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(
                          new Date(post.published_at || post.created_at),
                          "dd MMM yyyy",
                          { locale: ptBR }
                        )}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog
          open={!!selectedPost}
          onOpenChange={() => setSelectedPost(null)}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedPost && (
              <>
                {selectedPost.featured_image && (
                  <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                    <img
                      src={selectedPost.featured_image}
                      alt={selectedPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selectedPost.title}
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                    {selectedPost.author_name && (
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {selectedPost.author_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(
                        new Date(
                          selectedPost.published_at || selectedPost.created_at
                        ),
                        "dd 'de' MMMM 'de' yyyy",
                        { locale: ptBR }
                      )}
                    </span>
                  </div>
                </DialogHeader>
                <div className="prose prose-sm dark:prose-invert max-w-none mt-4">
                  {selectedPost.content.split("\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPost(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
