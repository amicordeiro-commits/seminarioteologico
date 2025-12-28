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
import { Library, Plus, Pencil, Trash2, Loader2, FileText, Video, Headphones, Upload, Sparkles, FolderUp, FileDown } from "lucide-react";
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
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [generatingAllPdfs, setGeneratingAllPdfs] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

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

  // Função para gerar todos os PDFs em lote
  const generateAllPdfs = async () => {
    const materialsToGenerate = materials.filter(m => m.category === "Bacharel");
    
    if (materialsToGenerate.length === 0) {
      toast.error("Nenhum material do Bacharel encontrado");
      return;
    }

    setGeneratingAllPdfs(true);
    setPdfProgress({ current: 0, total: materialsToGenerate.length });
    
    const results = { success: 0, failed: 0 };
    const generatedFiles: { title: string; html: string }[] = [];

    for (let i = 0; i < materialsToGenerate.length; i++) {
      const material = materialsToGenerate[i];
      setPdfProgress({ current: i + 1, total: materialsToGenerate.length });

      try {
        const { data, error } = await supabase.functions.invoke("generate-branded-pdf", {
          body: {
            title: material.title,
            category: material.category || "Bacharel em Teologia",
            content: material.description || "",
          },
        });

        if (error) throw error;
        if (data?.html) {
          generatedFiles.push({ title: material.title, html: data.html });
          results.success++;
        }
      } catch (err) {
        console.error(`Erro ao gerar PDF para ${material.title}:`, err);
        results.failed++;
      }

      // Pequena pausa para não sobrecarregar
      await new Promise(r => setTimeout(r, 300));
    }

    // Gerar um arquivo ZIP simulado baixando todos os HTMLs
    if (generatedFiles.length > 0) {
      // Criar um índice HTML com links para todos os materiais
      const indexHtml = generateIndexHtml(generatedFiles);
      
      const blob = new Blob([indexHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "POD_Seminario_Materiais_Bacharel.html";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setGeneratingAllPdfs(false);
    setPdfProgress({ current: 0, total: 0 });

    if (results.failed === 0) {
      toast.success(`${results.success} PDFs gerados com sucesso! Abra o arquivo baixado e use Ctrl+P para salvar cada um.`);
    } else {
      toast.warning(`${results.success} gerados, ${results.failed} falharam.`);
    }
  };

  // Gerar HTML índice com todos os materiais
  const generateIndexHtml = (files: { title: string; html: string }[]) => {
    const materialsListHtml = files.map((f, index) => `
      <div class="material-card" onclick="showMaterial(${index})">
        <span class="material-number">${index + 1}</span>
        <span class="material-title">${f.title}</span>
        <button class="print-btn" onclick="event.stopPropagation(); printMaterial(${index})">Imprimir PDF</button>
      </div>
    `).join("");

    const materialsDataJs = `const materialsData = ${JSON.stringify(files.map(f => f.html))};`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>P.O.D Seminário Teológico - Materiais do Bacharel</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Source+Sans+3:wght@400;500;600&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Source Sans 3', sans-serif;
      background: linear-gradient(135deg, #f5f3f0 0%, #e8e4de 100%);
      min-height: 100vh;
    }
    
    .header {
      background: linear-gradient(135deg, #4a1f2b 0%, #6b2c3d 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    
    .header h1 {
      font-family: 'Crimson Pro', serif;
      font-size: 2.5rem;
      margin-bottom: 10px;
    }
    
    .header p {
      color: #c9a227;
      font-size: 1.1rem;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .instructions {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-left: 4px solid #c9a227;
    }
    
    .instructions h2 {
      color: #6b2c3d;
      margin-bottom: 15px;
      font-family: 'Crimson Pro', serif;
    }
    
    .instructions ol {
      margin-left: 20px;
      color: #4a4a4a;
    }
    
    .instructions li {
      margin-bottom: 8px;
    }
    
    .materials-grid {
      display: grid;
      gap: 15px;
    }
    
    .material-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .material-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    }
    
    .material-number {
      background: #6b2c3d;
      color: white;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    .material-title {
      flex: 1;
      font-weight: 500;
      color: #1a1a1a;
    }
    
    .print-btn {
      background: #c9a227;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }
    
    .print-btn:hover {
      background: #b08d1f;
    }
    
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 1000;
    }
    
    .modal.active {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .modal-content {
      background: white;
      width: 95%;
      height: 95%;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .modal-header {
      background: #6b2c3d;
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .modal-header h3 {
      font-family: 'Crimson Pro', serif;
    }
    
    .modal-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }
    
    .modal-iframe {
      flex: 1;
      border: none;
    }
    
    .footer {
      text-align: center;
      padding: 30px;
      color: #6b2c3d;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✝ P.O.D Seminário Teológico</h1>
    <p>Materiais do Curso de Bacharel em Teologia</p>
  </div>
  
  <div class="container">
    <div class="instructions">
      <h2>📖 Como salvar os materiais em PDF</h2>
      <ol>
        <li>Clique em <strong>"Imprimir PDF"</strong> ao lado do material desejado</li>
        <li>Na janela de impressão, selecione <strong>"Salvar como PDF"</strong> como destino</li>
        <li>Clique em <strong>"Salvar"</strong> para baixar o PDF formatado</li>
      </ol>
    </div>
    
    <div class="materials-grid">
      ${materialsListHtml}
    </div>
  </div>
  
  <div class="footer">
    <p>P.O.D Seminário Teológico • Formando Líderes para o Reino de Deus</p>
  </div>
  
  <div class="modal" id="materialModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modalTitle">Material</h3>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <iframe class="modal-iframe" id="materialFrame"></iframe>
    </div>
  </div>
  
  <script>
    ${materialsDataJs}
    
    function showMaterial(index) {
      const modal = document.getElementById('materialModal');
      const frame = document.getElementById('materialFrame');
      const title = document.getElementById('modalTitle');
      
      title.textContent = 'Visualizando Material';
      frame.srcdoc = materialsData[index];
      modal.classList.add('active');
    }
    
    function closeModal() {
      document.getElementById('materialModal').classList.remove('active');
    }
    
    function printMaterial(index) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(materialsData[index]);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  </script>
</body>
</html>`;
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

  // Função para upload em lote
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setBatchUploading(true);
    setBatchProgress({ current: 0, total: files.length });

    const results = { success: 0, failed: 0 };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setBatchProgress({ current: i + 1, total: files.length });

      try {
        // Upload do arquivo
        const fileExt = file.name.split(".").pop()?.toLowerCase();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `materials/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("library")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("library")
          .getPublicUrl(filePath);

        // Determinar tipo de arquivo
        let fileType = "pdf";
        if (fileExt === "mp4" || fileExt === "mov" || fileExt === "avi") {
          fileType = "video";
        } else if (fileExt === "mp3" || fileExt === "wav" || fileExt === "m4a") {
          fileType = "audio";
        }

        // Criar título a partir do nome do arquivo
        const title = file.name
          .replace(/\.[^/.]+$/, "") // Remove extensão
          .replace(/_/g, " ") // Substitui underscores por espaços
          .replace(/-/g, " ") // Substitui hífens por espaços
          .trim();

        // Inserir material no banco
        const { error: insertError } = await supabase.from("library_materials").insert({
          title: title || file.name,
          description: `Material importado: ${file.name}`,
          category: "Bacharel",
          file_type: fileType,
          file_url: publicUrl,
          is_published: true,
        });

        if (insertError) throw insertError;

        results.success++;
      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error);
        results.failed++;
      }
    }

    setBatchUploading(false);
    setBatchProgress({ current: 0, total: 0 });
    queryClient.invalidateQueries({ queryKey: ["admin-materials"] });
    
    // Limpar o input
    if (batchFileInputRef.current) {
      batchFileInputRef.current.value = "";
    }

    if (results.failed === 0) {
      toast.success(`${results.success} arquivo(s) enviado(s) com sucesso!`);
    } else {
      toast.warning(`${results.success} enviado(s), ${results.failed} falharam.`);
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
          <div className="flex gap-2">
            <input
              type="file"
              ref={batchFileInputRef}
              onChange={handleBatchUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.mp3,.mp4,.wav"
              multiple
            />
            <Button
              variant="outline"
              onClick={() => batchFileInputRef.current?.click()}
              disabled={batchUploading}
              className="gap-2"
            >
              {batchUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {batchProgress.current}/{batchProgress.total}
                </>
              ) : (
                <>
                  <FolderUp className="w-4 h-4" />
                  Upload em Lote
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={generateAllPdfs}
              disabled={generatingAllPdfs}
              className="gap-2"
            >
              {generatingAllPdfs ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {pdfProgress.current}/{pdfProgress.total}
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Gerar Todos PDFs
                </>
              )}
            </Button>
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
                    accept=".pdf,.doc,.docx,.txt,.mp3,.mp4,.wav"
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
