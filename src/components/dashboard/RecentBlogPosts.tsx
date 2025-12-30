import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight, Calendar } from "lucide-react";
import { useRecentBlogPosts, BlogPost } from "@/hooks/useBlogPosts";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentBlogPostsProps {
  limit?: number;
}

export function RecentBlogPosts({ limit = 3 }: RecentBlogPostsProps) {
  const { data: posts = [], isLoading } = useRecentBlogPosts(limit);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Devocionais Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Devocionais Recentes
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/blog")}>
          Ver todos
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group cursor-pointer"
              onClick={() => navigate("/blog")}
            >
              <h4 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                {post.title}
              </h4>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Calendar className="h-3 w-3" />
                {format(
                  new Date(post.published_at || post.created_at),
                  "dd MMM",
                  { locale: ptBR }
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
