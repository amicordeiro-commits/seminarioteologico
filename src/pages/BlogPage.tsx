import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Calendar, User, ArrowRight, LogIn } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppLayout } from "@/components/layout/AppLayout";

export default function BlogPage() {
  const { data: posts = [], isLoading } = useBlogPosts(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Public header for non-authenticated users
  const PublicHeader = () => (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <a href="/home" className="text-xl font-serif font-semibold text-foreground hover:text-primary transition-colors">
          Seminário Teológico
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="gap-2">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Entrar</span>
          </Button>
        </div>
      </div>
    </header>
  );

  const BlogContent = () => (
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
              onClick={() => navigate(`/blog/${post.id}`)}
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
    </div>
  );

  // Show loading state
  if (isLoading || authLoading) {
    const LoadingContent = (
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
    );

    // If user is already known to be logged in, show AppLayout
    if (user) {
      return <AppLayout>{LoadingContent}</AppLayout>;
    }

    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        {LoadingContent}
      </div>
    );
  }

  // Authenticated user - use AppLayout with sidebar
  if (user) {
    return (
      <AppLayout>
        <BlogContent />
      </AppLayout>
    );
  }

  // Non-authenticated user - show public layout
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <BlogContent />
    </div>
  );
}
