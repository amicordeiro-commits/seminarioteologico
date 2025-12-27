import { useState, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Library, Plus, Pencil, Trash2, Loader2, FileText, Video, Headphones, Upload, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Material {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_type: string | null;
  file_url: string | null;
  is_published: boolean | null;
  download_count: number | null;
}

const defaultMaterial: Partial<Material> = {
  title: "",
  description: "",
  category: "Teologia",
  file_type: "pdf",
  file_url: "",
  is_published: true,
};

export default function AdminLibraryPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Partial<Material> | null>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para gerar PDF personalizado com marca P.O.D
  const generateBrandedPdf = async (material: Material) => {
    setGeneratingPdf(material.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-branded-pdf", {
        body: {
          title: material.title,
          category: material.category || "Material Didático",
          content: material.description || "",
          authorName: "",
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.html) throw new Error("Falha ao gerar o PDF.");

      // Tenta abrir o HTML em uma nova aba para imprimir/salvar como PDF
      const popup = window.open("", "_blank");
      
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Popup bloqueado - usar método alternativo com download de HTML
        toast.warning(
          "Popup bloqueado! Clique no link abaixo para abrir o PDF.",
          { duration: 10000 }
        );
        
        // Cria um blob e faz download do HTML
        const blob = new Blob([data.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${material.title.replace(/[^a-zA-Z0-9]/g, '_')}_POD.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.info("Arquivo HTML baixado! Abra-o no navegador e use Ctrl+P para salvar como PDF.");
        return;
      }

      popup.document.open();
      popup.document.write(data.html);
      popup.document.close();

      await new Promise((r) => setTimeout(r, 700));
      popup.focus();
      popup.print();

      toast.success("PDF gerado com a marca P.O.D Seminário Teológico!");
    } catch (err) {
      console.error("Error generating branded PDF:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro ao gerar PDF: ${errorMessage}`);
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `materials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("library")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("library")
        .getPublicUrl(filePath);

      setEditingMaterial({ ...editingMaterial, file_url: publicUrl });
      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  };

  // Fetch materials
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["admin-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Material[];
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (material: Partial<Material>) => {
      if (material.id) {
        const { error } = await supabase
          .from("library_materials")
          .update({
            title: material.title,
            description: material.description,
            category: material.category,
            file_type: material.file_type,
            file_url: material.file_url,
            is_published: material.is_published,
          })
          .eq("id", material.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("library_materials").insert({
          title: material.title!,
          description: material.description,
          category: material.category,
          file_type: material.file_type,
          file_url: material.file_url,
          is_published: material.is_published,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-materials"] });
      toast.success("Material salvo com sucesso!");
      setIsDialogOpen(false);
      setEditingMaterial(null);
    },
    onError: () => {
      toast.error("Erro ao salvar material");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("library_materials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-materials"] });
      toast.success("Material excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir material");
    },
  });

  const getFileIcon = (type: string | null) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "audio":
        return <Headphones className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleSave = () => {
    if (!editingMaterial?.title) {
      toast.error("Preencha o título");
      return;
    }
    saveMutation.mutate(editingMaterial);
  };

  const filteredMaterials = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <Library className="w-8 h-8 text-primary" />
              Gerenciar Biblioteca
            </h1>
            <p className="text-muted-foreground mt-1">
              {materials.length} materiais cadastrados
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingMaterial(defaultMaterial);
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Material
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar materiais..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        {/* Materials Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material) => (
              <Card key={material.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(material.file_type)}
                      <CardTitle className="text-lg">{material.title}</CardTitle>
                    </div>
                    <Badge variant={material.is_published ? "default" : "secondary"}>
                      {material.is_published ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {material.description || "Sem descrição"}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{material.category}</span>
                    <span>•</span>
                    <span>{material.download_count || 0} downloads</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingMaterial(material);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => generateBrandedPdf(material)}
                      disabled={generatingPdf === material.id}
                      title="Gerar PDF com marca P.O.D"
                    >
                      {generatingPdf === material.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(material.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial?.id ? "Editar Material" : "Novo Material"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={editingMaterial?.title || ""}
                  onChange={(e) =>
                    setEditingMaterial({ ...editingMaterial, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingMaterial?.description || ""}
                  onChange={(e) =>
                    setEditingMaterial({ ...editingMaterial, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={editingMaterial?.category || "Teologia"}
                    onValueChange={(value) =>
                      setEditingMaterial({ ...editingMaterial, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bíblias">Bíblias</SelectItem>
                      <SelectItem value="Teologia Sistemática">Teologia Sistemática</SelectItem>
                      <SelectItem value="Comentários">Comentários</SelectItem>
                      <SelectItem value="Línguas Bíblicas">Línguas Bíblicas</SelectItem>
                      <SelectItem value="História da Igreja">História da Igreja</SelectItem>
                      <SelectItem value="Devocionais">Devocionais</SelectItem>
                      <SelectItem value="Sermões">Sermões</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Arquivo</Label>
                  <Select
                    value={editingMaterial?.file_type || "pdf"}
                    onValueChange={(value) =>
                      setEditingMaterial({ ...editingMaterial, file_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="audio">Áudio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Arquivo</Label>
                <div className="flex gap-2">
                  <Input
                    value={editingMaterial?.file_url || ""}
                    onChange={(e) =>
                      setEditingMaterial({ ...editingMaterial, file_url: e.target.value })
                    }
                    placeholder="https://... ou faça upload"
                    className="flex-1"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.mp3,.mp4,.wav"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingMaterial?.is_published || false}
                  onCheckedChange={(checked) =>
                    setEditingMaterial({ ...editingMaterial, is_published: checked })
                  }
                />
                <Label>Publicado</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
