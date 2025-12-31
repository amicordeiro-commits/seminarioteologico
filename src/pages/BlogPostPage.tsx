import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, LogIn } from "lucide-react";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading } = useBlogPost(id || "");
  const { user, loading: authLoading } = useAuth();

  // Always use the published domain for sharing (not preview domain)
  const publishedDomain = "https://hjorsjoaykgnsmbxgnyn.lovable.app";
  const publicUrl = id ? `${publishedDomain}/p/blog/${id}` : "";

  // Update meta tags for social sharing
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Seminário Teológico`;

      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("property", property);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      const updateNameMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", name);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      updateMetaTag("og:title", post.title);
      updateMetaTag("og:description", post.excerpt || post.content.substring(0, 160));
      updateMetaTag("og:type", "article");
      updateMetaTag("og:url", publicUrl);
      if (post.featured_image) {
        updateMetaTag("og:image", post.featured_image);
        updateMetaTag("og:image:width", "1200");
        updateMetaTag("og:image:height", "630");
      }

      updateNameMetaTag("twitter:card", "summary_large_image");
      updateNameMetaTag("twitter:title", post.title);
      updateNameMetaTag("twitter:description", post.excerpt || post.content.substring(0, 160));
      if (post.featured_image) {
        updateNameMetaTag("twitter:image", post.featured_image);
      }
    }

    return () => {
      document.title = "Seminário Teológico";
    };
  }, [post, publicUrl]);

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

  const PostContent = () => (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/blog")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar ao Blog
      </Button>

      <article>
        {/* Featured Image */}
        {post?.featured_image && (
          <div className="aspect-video w-full overflow-hidden rounded-xl mb-6">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post?.title}</h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          {post?.author_name && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {post.author_name}
            </span>
          )}
          {post && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(
                new Date(post.published_at || post.created_at),
                "dd 'de' MMMM 'de' yyyy",
                { locale: ptBR }
              )}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {post?.content.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* CTA for non-authenticated users */}
        {!user && (
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="py-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Quer acessar mais conteúdos?</h3>
              <p className="text-muted-foreground mb-4">
                Entre na plataforma para ter acesso a cursos, devocionais e muito mais!
              </p>
              <Button onClick={() => navigate("/auth")} className="gap-2">
                <LogIn className="h-4 w-4" />
                Entrar ou Cadastrar
              </Button>
            </CardContent>
          </Card>
        )}
      </article>
    </div>
  );

  // Loading state
  if (isLoading || authLoading) {
    const LoadingContent = (
      <div className="container mx-auto py-6 px-4 max-w-3xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );

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

  // Post not found
  if (!post) {
    const NotFoundContent = (
      <div className="container mx-auto py-6 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
        <Button onClick={() => navigate("/blog")}>Voltar ao Blog</Button>
      </div>
    );

    if (user) {
      return <AppLayout>{NotFoundContent}</AppLayout>;
    }

    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        {NotFoundContent}
      </div>
    );
  }

  // Authenticated user - use AppLayout
  if (user) {
    return (
      <AppLayout>
        <PostContent />
      </AppLayout>
    );
  }

  // Non-authenticated user - public layout
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <PostContent />
    </div>
  );
}
