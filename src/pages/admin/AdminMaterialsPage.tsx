import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Download, Loader2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Material {
  id: string;
  title: string;
  filename: string;
  category: string;
}

const MATERIALS: Material[] = [
  { id: '1', title: 'Administração Eclesiástica', filename: 'administracao_eclesiastica.txt', category: 'Teologia Prática' },
  { id: '2', title: 'Teologia do Antigo Testamento', filename: 'antigo_testamento.txt', category: 'Teologia Bíblica' },
  { id: '3', title: 'Arqueologia Bíblica', filename: 'arqueologia_biblica.txt', category: 'Estudos Bíblicos' },
  { id: '4', title: 'Bibliologia', filename: 'bibliologia.txt', category: 'Teologia Sistemática' },
  { id: '5', title: 'O Culto Bíblico', filename: 'culto_biblico.txt', category: 'Teologia Prática' },
  { id: '6', title: 'Doutrinas Bíblicas', filename: 'doutrinas_biblicas.txt', category: 'Teologia Sistemática' },
  { id: '7', title: 'Educação Cristã', filename: 'educacao_crista.txt', category: 'Teologia Prática' },
  { id: '8', title: 'Estatutos da Igreja', filename: 'estatutos_igreja.txt', category: 'Administração' },
  { id: '9', title: 'Ética Cristã', filename: 'etica.txt', category: 'Teologia Prática' },
  { id: '10', title: 'Evangelismo Pessoal', filename: 'evangelismo_pessoal.txt', category: 'Missões' },
];

// Função para remover referências bibliográficas e linhas de número
function cleanContent(text: string): string {
  const lines = text.split('\n');
  const cleanedLines: string[] = [];
  
  let skipSection = false;
  
  for (const line of lines) {
    // Remove linhas com números de linha no início
    const cleanLine = line.replace(/^\d+:\s*/, '');
    
    // Ignora linhas de referências bibliográficas
    const lowerLine = cleanLine.toLowerCase();
    if (
      lowerLine.includes('referência bibliográfica') ||
      lowerLine.includes('referências bibliográficas') ||
      lowerLine.includes('bibliografia') ||
      lowerLine.includes('fonte:') ||
      lowerLine.includes('adaptado de') ||
      lowerLine.includes('retirado de') ||
      lowerLine.includes('extraído de')
    ) {
      skipSection = true;
      continue;
    }
    
    // Para de pular quando encontra um título novo (linha toda em maiúsculas ou começa com número romano)
    if (skipSection && (
      cleanLine.match(/^[IVX]+\.\s/) ||
      cleanLine.match(/^[A-Z\s]{10,}$/) ||
      cleanLine.match(/^CAPÍTULO/) ||
      cleanLine.match(/^LIÇÃO/)
    )) {
      skipSection = false;
    }
    
    if (skipSection) continue;
    
    // Remove menções a "imagem meramente ilustrativa"
    if (lowerLine.includes('imagem meramente ilustrativa')) continue;
    
    // Remove URLs e links
    if (cleanLine.match(/https?:\/\/|www\./)) continue;
    
    // Remove linhas com ISBN, DOI, etc
    if (lowerLine.includes('isbn') || lowerLine.includes('doi:')) continue;
    
    cleanedLines.push(cleanLine);
  }
  
  return cleanedLines.join('\n').trim();
}

// Função para formatar o conteúdo em HTML
function formatContentToHtml(text: string): string {
  const lines = text.split('\n');
  let html = '';
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      continue;
    }
    
    // Títulos principais (linhas em maiúsculas)
    if (line.match(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]{15,}$/) && !line.includes('  ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h2>${line}</h2>\n`;
      continue;
    }
    
    // Títulos com números romanos
    if (line.match(/^[IVX]+[\.\-]\s/)) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h3>${line}</h3>\n`;
      continue;
    }
    
    // Títulos numerados
    if (line.match(/^\d+[\.\)]\s/) && line.length < 100) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h4>${line}</h4>\n`;
      continue;
    }
    
    // Itens de lista com letras ou traços
    if (line.match(/^[a-z]\)\s/) || line.match(/^[\-•]\s/)) {
      if (!inList) { html += '<ul>\n'; inList = true; }
      html += `<li>${line.replace(/^[a-z]\)\s|^[\-•]\s/, '')}</li>\n`;
      continue;
    }
    
    // Versículos bíblicos (formato "Livro capítulo:versículo")
    if (line.match(/\([A-Z][a-z]+\s\d+[\.:]\d+.*\)/) || line.match(/[A-Z][a-z]+\s\d+[\.:]\d+/)) {
      html += `<blockquote>${line}</blockquote>\n`;
      continue;
    }
    
    // Parágrafos normais
    if (inList) { html += '</ul>\n'; inList = false; }
    html += `<p>${line}</p>\n`;
  }
  
  if (inList) html += '</ul>\n';
  
  return html;
}

export default function AdminMaterialsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);

  const handleGeneratePdf = async (material: Material, preview = false) => {
    const stateFunc = preview ? setPreviewing : setLoading;
    stateFunc(material.id);
    
    try {
      // Carregar o conteúdo do arquivo
      const response = await fetch(`/materials/bacharel/${material.filename}`);
      if (!response.ok) throw new Error('Arquivo não encontrado');
      
      const rawContent = await response.text();
      const cleanedContent = cleanContent(rawContent);
      const htmlContent = formatContentToHtml(cleanedContent);
      
      // Chamar a edge function para gerar o PDF
      const { data, error } = await supabase.functions.invoke('generate-branded-pdf', {
        body: {
          title: material.title,
          category: material.category,
          content: htmlContent,
          authorName: '', // Sem referência biográfica
        },
      });
      
      if (error) throw error;
      
      if (preview) {
        // Abrir em nova aba para preview
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(data.html);
          newWindow.document.close();
        }
      } else {
        // Criar e baixar o PDF
        const blob = new Blob([data.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          newWindow.onload = () => {
            newWindow.print();
          };
        }
        
        toast.success('PDF gerado! Use Ctrl+P para salvar como PDF.');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar o material');
    } finally {
      stateFunc(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Teologia Sistemática': return 'bg-primary/20 text-primary';
      case 'Teologia Bíblica': return 'bg-accent/20 text-accent-foreground';
      case 'Teologia Prática': return 'bg-emerald-500/20 text-emerald-700';
      case 'Estudos Bíblicos': return 'bg-blue-500/20 text-blue-700';
      case 'Missões': return 'bg-orange-500/20 text-orange-700';
      case 'Administração': return 'bg-purple-500/20 text-purple-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif">
            Materiais Didáticos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gere PDFs formatados com a identidade visual do P.O.D Seminário Teológico
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MATERIALS.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-primary" />
                  <Badge className={getCategoryColor(material.category)}>
                    {material.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-serif mt-3">
                  {material.title}
                </CardTitle>
                <CardDescription>
                  Curso Superior de Teologia
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleGeneratePdf(material, true)}
                  disabled={previewing === material.id || loading === material.id}
                >
                  {previewing === material.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  Visualizar
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleGeneratePdf(material, false)}
                  disabled={loading === material.id || previewing === material.id}
                >
                  {loading === material.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Gerar PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
