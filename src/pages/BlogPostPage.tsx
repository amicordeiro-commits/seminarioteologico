import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Share2, Facebook, Copy, Check } from "lucide-react";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading } = useBlogPost(id || "");
  const [copied, setCopied] = useState(false);

  // URL for regular viewing
  const postUrl = typeof window !== "undefined" ? window.location.href : "";
  
  // URL for Facebook sharing (uses edge function for proper OG tags)
  const ogShareUrl = `https://hjorsjoaykgnsmbxgnyn.supabase.co/functions/v1/og-blog?id=${id}`;

  // Update meta tags for social sharing
  useEffect(() => {
    if (post) {
      // Update title
      document.title = `${post.title} | Seminário Teológico`;

      // Update or create meta tags
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

      // Open Graph tags for Facebook
      updateMetaTag("og:title", post.title);
      updateMetaTag("og:description", post.excerpt || post.content.substring(0, 160));
      updateMetaTag("og:type", "article");
      updateMetaTag("og:url", postUrl);
      if (post.featured_image) {
        updateMetaTag("og:image", post.featured_image);
        updateMetaTag("og:image:width", "1200");
        updateMetaTag("og:image:height", "630");
      }

      // Twitter Card tags
      updateNameMetaTag("twitter:card", "summary_large_image");
      updateNameMetaTag("twitter:title", post.title);
      updateNameMetaTag("twitter:description", post.excerpt || post.content.substring(0, 160));
      if (post.featured_image) {
        updateNameMetaTag("twitter:image", post.featured_image);
      }
    }

    return () => {
      // Cleanup - restore default title
      document.title = "Seminário Teológico";
    };
  }, [post, postUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ogShareUrl)}`;
    window.open(fbUrl, "_blank", "width=600,height=400");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 px-4 max-w-3xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
          <Button onClick={() => navigate("/blog")}>Voltar ao Blog</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
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
          {post.featured_image && (
            <div className="aspect-video w-full overflow-hidden rounded-xl mb-6">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            {post.author_name && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(
                new Date(post.published_at || post.created_at),
                "dd 'de' MMMM 'de' yyyy",
                { locale: ptBR }
              )}
            </span>
          </div>

          {/* Share Buttons */}
          <Card className="mb-8">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Compartilhar:
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareFacebook}
                    className="gap-2"
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="gap-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copiado!" : "Copiar Link"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Bottom Share */}
          <div className="mt-12 pt-6 border-t">
            <p className="text-center text-muted-foreground mb-4">
              Gostou? Compartilhe com seus amigos!
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleShareFacebook} className="gap-2">
                <Facebook className="h-4 w-4" />
                Compartilhar no Facebook
              </Button>
              <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copiar Link
              </Button>
            </div>
          </div>
        </article>
      </div>
    </AppLayout>
  );
}
