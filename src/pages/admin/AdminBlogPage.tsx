import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Wand2,
  Loader2,
  FileText,
  Eye,
  ImageIcon,
  X,
} from "lucide-react";
import {
  useBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  useGenerateDevotional,
  BlogPost,
} from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminBlogPage() {
  const { data: posts = [], isLoading } = useBlogPosts(false);
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const generateDevotional = useGenerateDevotional();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author_name: "",
    featured_image: "",
    is_published: false,
  });
  const [aiTopic, setAiTopic] = useState("");
  const [aiBibleRef, setAiBibleRef] = useState("");

  const handleOpenForm = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        author_name: post.author_name || "",
        featured_image: post.featured_image || "",
        is_published: post.is_published,
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        author_name: "",
        featured_image: "",
        is_published: false,
      });
    }
    setIsFormOpen(true);
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const result = await generateDevotional.mutateAsync({
        topic: aiTopic || undefined,
        bibleReference: aiBibleRef || undefined,
      });

      setFormData({
        ...formData,
        title: result.title,
        content: result.content,
        excerpt: result.excerpt,
        featured_image: result.imageUrl || "",
      });

      if (result.imageUrl) {
        toast.success("Conteúdo e imagem gerados com sucesso!");
      } else {
        toast.success("Conteúdo gerado com sucesso!");
      }
      setAiTopic("");
      setAiBibleRef("");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Erro ao gerar conteúdo. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }

    try {
      if (editingPost) {
        await updatePost.mutateAsync({
          id: editingPost.id,
          ...formData,
        });
        toast.success("Post atualizado com sucesso!");
      } else {
        await createPost.mutateAsync(formData);
        toast.success("Post criado com sucesso!");
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Erro ao salvar post");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;

    try {
      await deletePost.mutateAsync(id);
      toast.success("Post excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Erro ao excluir post");
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      await updatePost.mutateAsync({
        id: post.id,
        is_published: !post.is_published,
      });
      toast.success(
        post.is_published ? "Post despublicado" : "Post publicado!"
      );
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("Erro ao alterar status do post");
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, featured_image: "" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blog / Devocionais</h1>
            <p className="text-muted-foreground">
              Gerencie os posts do blog com IA para criação de conteúdo e imagens
            </p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Post
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Posts do Blog ({posts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum post criado ainda</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleOpenForm()}
                >
                  Criar primeiro post
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagem</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {post.title}
                      </TableCell>
                      <TableCell>{post.author_name || "Admin"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={post.is_published ? "default" : "secondary"}
                        >
                          {post.is_published ? "Publicado" : "Rascunho"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(post.created_at), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTogglePublish(post)}
                            title={
                              post.is_published ? "Despublicar" : "Publicar"
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenForm(post)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Editar Post" : "Novo Post"}
              </DialogTitle>
            </DialogHeader>

            {/* AI Generation Section */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  Gerar com IA (Texto + Imagem)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ai-topic">Tema (opcional)</Label>
                    <Input
                      id="ai-topic"
                      placeholder="Ex: Fé, Esperança, Gratidão..."
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ai-ref">Referência Bíblica (opcional)</Label>
                    <Input
                      id="ai-ref"
                      placeholder="Ex: João 3:16, Salmo 23..."
                      value={aiBibleRef}
                      onChange={(e) => setAiBibleRef(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando conteúdo e imagem...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Gerar Devocional com IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Featured Image Preview */}
              {formData.featured_image && (
                <div className="relative">
                  <Label>Imagem de Capa (Gerada pela IA)</Label>
                  <div className="relative mt-2 rounded-lg overflow-hidden">
                    <img
                      src={formData.featured_image}
                      alt="Imagem de capa"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Título do post"
                  required
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Resumo</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Breve descrição do post"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Conteúdo completo do post"
                  rows={10}
                  required
                />
              </div>

              <div>
                <Label htmlFor="author">Nome do Autor</Label>
                <Input
                  id="author"
                  value={formData.author_name}
                  onChange={(e) =>
                    setFormData({ ...formData, author_name: e.target.value })
                  }
                  placeholder="Nome do autor"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_published: checked })
                  }
                />
                <Label htmlFor="published">Publicar imediatamente</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createPost.isPending || updatePost.isPending}
                >
                  {createPost.isPending || updatePost.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {editingPost ? "Salvar Alterações" : "Criar Post"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
