import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Download, Loader2, Eye, Upload, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
interface Material {
  id: string;
  title: string;
  filename: string;
  category: string;
}

interface MaterialGroup {
  name: string;
  folder: string;
  materials: Material[];
}

const MATERIAL_GROUPS: MaterialGroup[] = [
  {
    name: 'Bacharel em Teologia',
    folder: 'bacharel',
    materials: [
      { id: 'b1', title: 'Administração Eclesiástica', filename: 'administracao_eclesiastica.txt', category: 'Teologia Prática' },
      { id: 'b2', title: 'Teologia do Antigo Testamento', filename: 'antigo_testamento.txt', category: 'Teologia Bíblica' },
      { id: 'b3', title: 'Arqueologia Bíblica', filename: 'arqueologia_biblica.txt', category: 'Estudos Bíblicos' },
      { id: 'b4', title: 'Bibliologia', filename: 'bibliologia.txt', category: 'Teologia Sistemática' },
      { id: 'b5', title: 'O Culto Bíblico', filename: 'culto_biblico.txt', category: 'Teologia Prática' },
      { id: 'b6', title: 'Doutrinas Bíblicas', filename: 'doutrinas_biblicas.txt', category: 'Teologia Sistemática' },
      { id: 'b7', title: 'Educação Cristã', filename: 'educacao_crista.txt', category: 'Teologia Prática' },
      { id: 'b8', title: 'Estatutos da Igreja', filename: 'estatutos_igreja.txt', category: 'Administração' },
      { id: 'b9', title: 'Ética Cristã', filename: 'etica.txt', category: 'Teologia Prática' },
      { id: 'b10', title: 'Evangelismo Pessoal', filename: 'evangelismo_pessoal.txt', category: 'Missões' },
      { id: 'b11', title: 'Teologia Pastoral', filename: 'teologia_pastoral.txt', category: 'Teologia Prática' },
    ],
  },
  {
    name: 'Doutorado em Teologia',
    folder: 'doutorado',
    materials: [
      { id: 'd1', title: 'Apologética do Antigo Testamento', filename: 'apologetica_at.txt', category: 'Apologética' },
      { id: 'd2', title: 'Apologética do Novo Testamento', filename: 'apologetica_nt.txt', category: 'Apologética' },
      { id: 'd3', title: 'Capelania Evangélica', filename: 'capelania_evangelica.txt', category: 'Teologia Prática' },
      { id: 'd4', title: 'Direito e Religião', filename: 'direito_religiao.txt', category: 'Estudos Interdisciplinares' },
      { id: 'd5', title: 'Ética Cristã', filename: 'etica_crista.txt', category: 'Teologia Prática' },
      { id: 'd6', title: 'Exegese Bíblica', filename: 'exegese_biblica.txt', category: 'Estudos Bíblicos' },
      { id: 'd7', title: 'Fenomenologia da Religião', filename: 'fenomenologia_religiao.txt', category: 'Estudos Interdisciplinares' },
      { id: 'd8', title: 'Filosofia Cristã', filename: 'filosofia_crista.txt', category: 'Filosofia' },
      { id: 'd9', title: 'Filosofia da Educação', filename: 'filosofia_educacao.txt', category: 'Filosofia' },
      { id: 'd10', title: 'Hermenêutica Bíblica', filename: 'hermeneutica_biblica.txt', category: 'Estudos Bíblicos' },
      { id: 'd11', title: 'História da Igreja', filename: 'historia_igreja.txt', category: 'História' },
      { id: 'd12', title: 'Homilética Narrativa', filename: 'homiletica_narrativa.txt', category: 'Teologia Prática' },
      { id: 'd13', title: 'Liturgia', filename: 'liturgia.txt', category: 'Teologia Prática' },
      { id: 'd14', title: 'Psicologia Geral', filename: 'psicologia_geral.txt', category: 'Psicologia' },
      { id: 'd15', title: 'Psicologia Pastoral', filename: 'psicologia_pastoral.txt', category: 'Psicologia' },
      { id: 'd16', title: 'Sociologia e Antropologia da Religião', filename: 'sociologia_antropologia_religiao.txt', category: 'Estudos Interdisciplinares' },
      { id: 'd17', title: 'Temas Atuais da Teologia', filename: 'temas_atuais_teologia.txt', category: 'Teologia Sistemática' },
      { id: 'd18', title: 'Teologia Espiritual', filename: 'teologia_espiritual.txt', category: 'Teologia Sistemática' },
    ],
  },
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

// Função para formatar o conteúdo em HTML profissional
function formatContentToHtml(text: string): string {
  const lines = text.split('\n');
  const htmlParts: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let currentParagraph: string[] = [];
  
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        htmlParts.push(`<p>${text}</p>`);
      }
      currentParagraph = [];
    }
  };
  
  const closeList = () => {
    if (inList) {
      htmlParts.push(`</${listType}>`);
      inList = false;
    }
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Linha vazia - finaliza parágrafo atual
    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }
    
    // Ignora linhas de cabeçalho do curso
    if (line.match(/^CURSO SUPERIOR/i) || line.match(/^DISCIPLINA:/i)) {
      continue;
    }
    
    // Títulos principais (CONCEITO GERAL, INTRODUÇÃO, etc.)
    if (line.match(/^(CONCEITO GERAL|INTRODUÇÃO|CONCLUSÃO|CONSIDERAÇÕES FINAIS)/i)) {
      flushParagraph();
      closeList();
      htmlParts.push(`<h1>${capitalizeTitle(line)}</h1>`);
      continue;
    }
    
    // Títulos em maiúsculas (mais de 10 caracteres, sem pontuação)
    if (line.match(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇÑ\s]{10,}$/) && !line.includes('.') && line.length < 80) {
      flushParagraph();
      closeList();
      htmlParts.push(`<h2>${capitalizeTitle(line)}</h2>`);
      continue;
    }
    
    // Títulos com números romanos (I., II., III., etc.)
    if (line.match(/^[IVXLC]+[\.\-\)]\s+/i)) {
      flushParagraph();
      closeList();
      const content = line.replace(/^[IVXLC]+[\.\-\)]\s+/i, '');
      htmlParts.push(`<h3>${capitalizeTitle(content)}</h3>`);
      continue;
    }
    
    // Títulos numerados (1., 2., 1-, etc.) - curtos
    if (line.match(/^\d+[\.\-\)]\s+/) && line.length < 80 && !line.match(/^\d+[\.\-\)]\s+[a-z]/)) {
      flushParagraph();
      closeList();
      const content = line.replace(/^\d+[\.\-\)]\s+/, '');
      htmlParts.push(`<h4>${content}</h4>`);
      continue;
    }
    
    // Itens de lista ordenada (1. algo, 2. algo)
    if (line.match(/^\d+[\.\)]\s+/) && line.length > 20) {
      flushParagraph();
      if (!inList || listType !== 'ol') {
        closeList();
        htmlParts.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      const content = line.replace(/^\d+[\.\)]\s+/, '');
      htmlParts.push(`<li>${content}</li>`);
      continue;
    }
    
    // Itens de lista com letras (a), b), c)) ou traços/bullets
    if (line.match(/^[a-z]\)\s+/i) || line.match(/^[\-•►▸◆]\s+/)) {
      flushParagraph();
      if (!inList || listType !== 'ul') {
        closeList();
        htmlParts.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      const content = line.replace(/^[a-z]\)\s+|^[\-•►▸◆]\s+/i, '');
      htmlParts.push(`<li>${content}</li>`);
      continue;
    }
    
    // Versículos bíblicos (Gn 1:1, João 3.16, etc.)
    const bibleRefPattern = /([1-3]?\s?[A-ZÁ][a-záéíóúâêôã]+\.?\s+\d+[:\.\,]\d+(?:\-\d+)?)/;
    if (line.match(bibleRefPattern) && line.length < 300) {
      flushParagraph();
      closeList();
      htmlParts.push(`<blockquote>${formatBibleVerse(line)}</blockquote>`);
      continue;
    }
    
    // Linha que parece citação (começa com aspas ou é curta e entre aspas)
    if ((line.startsWith('"') || line.startsWith('"') || line.startsWith("'")) && line.length < 200) {
      flushParagraph();
      closeList();
      htmlParts.push(`<blockquote>${line}</blockquote>`);
      continue;
    }
    
    // Caso contrário, adiciona ao parágrafo atual
    closeList();
    currentParagraph.push(line);
    
    // Se a linha termina com ponto, fecha o parágrafo
    if (line.match(/[.!?]$/)) {
      flushParagraph();
    }
  }
  
  flushParagraph();
  closeList();
  
  return htmlParts.join('\n');
}

// Capitaliza título (primeira letra de cada palavra importante)
function capitalizeTitle(text: string): string {
  const lowerWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'em', 'no', 'na', 'nos', 'nas', 'para', 'com', 'por', 'que'];
  return text.toLowerCase().split(' ').map((word, index) => {
    if (index === 0 || !lowerWords.includes(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
  }).join(' ');
}

// Formata versículo bíblico destacando a referência
function formatBibleVerse(text: string): string {
  const refPattern = /([1-3]?\s?[A-ZÁ][a-záéíóúâêôã]+\.?\s+\d+[:\.\,]\d+(?:\-\d+)?)/g;
  return text.replace(refPattern, '<strong>$1</strong>');
}

// Mapeamento de títulos para arquivos locais
const TITLE_TO_FILE_MAP: Record<string, { folder: string; filename: string }> = {
  'Administração Eclesiástica': { folder: 'bacharel', filename: 'administracao_eclesiastica.txt' },
  'Teologia do Antigo Testamento': { folder: 'bacharel', filename: 'antigo_testamento.txt' },
  'Antigo Testamento': { folder: 'bacharel', filename: 'antigo_testamento.txt' },
  'Arqueologia Bíblica': { folder: 'bacharel', filename: 'arqueologia_biblica.txt' },
  'Bibliologia': { folder: 'bacharel', filename: 'bibliologia.txt' },
  'Culto Bíblico': { folder: 'bacharel', filename: 'culto_biblico.txt' },
  'O Culto Bíblico': { folder: 'bacharel', filename: 'culto_biblico.txt' },
  'Doutrinas Bíblicas': { folder: 'bacharel', filename: 'doutrinas_biblicas.txt' },
  'Educação Cristã': { folder: 'bacharel', filename: 'educacao_crista.txt' },
  'Estatutos da Igreja': { folder: 'bacharel', filename: 'estatutos_igreja.txt' },
  'Ética Cristã': { folder: 'bacharel', filename: 'etica.txt' },
  'Ética': { folder: 'bacharel', filename: 'etica.txt' },
  'Evangelismo Pessoal': { folder: 'bacharel', filename: 'evangelismo_pessoal.txt' },
  'Teologia Pastoral': { folder: 'bacharel', filename: 'teologia_pastoral.txt' },
  // Doutorado
  'Apologética do Antigo Testamento': { folder: 'doutorado', filename: 'apologetica_at.txt' },
  'Apologética do Novo Testamento': { folder: 'doutorado', filename: 'apologetica_nt.txt' },
  'Capelania Evangélica': { folder: 'doutorado', filename: 'capelania_evangelica.txt' },
  'Direito e Religião': { folder: 'doutorado', filename: 'direito_religiao.txt' },
  'Exegese Bíblica': { folder: 'doutorado', filename: 'exegese_biblica.txt' },
  'Fenomenologia da Religião': { folder: 'doutorado', filename: 'fenomenologia_religiao.txt' },
  'Filosofia Cristã': { folder: 'doutorado', filename: 'filosofia_crista.txt' },
  'Filosofia da Educação': { folder: 'doutorado', filename: 'filosofia_educacao.txt' },
  'Hermenêutica Bíblica': { folder: 'doutorado', filename: 'hermeneutica_biblica.txt' },
  'História da Igreja': { folder: 'doutorado', filename: 'historia_igreja.txt' },
  'Homilética Narrativa': { folder: 'doutorado', filename: 'homiletica_narrativa.txt' },
  'Liturgia': { folder: 'doutorado', filename: 'liturgia.txt' },
  'Psicologia Geral': { folder: 'doutorado', filename: 'psicologia_geral.txt' },
  'Psicologia Pastoral': { folder: 'doutorado', filename: 'psicologia_pastoral.txt' },
  'Sociologia e Antropologia da Religião': { folder: 'doutorado', filename: 'sociologia_antropologia_religiao.txt' },
  'Temas Atuais da Teologia': { folder: 'doutorado', filename: 'temas_atuais_teologia.txt' },
  'Teologia Espiritual': { folder: 'doutorado', filename: 'teologia_espiritual.txt' },
};

export default function AdminMaterialsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);

  // Função para importar conteúdo dos arquivos TXT para o banco de dados
  const handleImportContent = async () => {
    setImporting(true);
    setImportResults(null);
    
    let successCount = 0;
    let failedCount = 0;
    
    try {
      // Buscar todos os materiais sem conteúdo
      const { data: materials, error: fetchError } = await supabase
        .from('library_materials')
        .select('id, title')
        .is('content', null);
      
      if (fetchError) throw fetchError;
      
      if (!materials || materials.length === 0) {
        toast.info('Todos os materiais já possuem conteúdo!');
        setImporting(false);
        return;
      }
      
      toast.info(`Importando conteúdo para ${materials.length} materiais...`);
      
      for (const material of materials) {
        const fileInfo = TITLE_TO_FILE_MAP[material.title];
        
        if (!fileInfo) {
          console.log(`Sem arquivo mapeado para: ${material.title}`);
          failedCount++;
          continue;
        }
        
        try {
          // Buscar conteúdo do arquivo
          const response = await fetch(`/materials/${fileInfo.folder}/${fileInfo.filename}`);
          
          if (!response.ok) {
            console.log(`Arquivo não encontrado: ${fileInfo.filename}`);
            failedCount++;
            continue;
          }
          
          const content = await response.text();
          
          if (!content || content.length < 100) {
            console.log(`Conteúdo vazio ou muito curto: ${fileInfo.filename}`);
            failedCount++;
            continue;
          }
          
          // Atualizar o material com o conteúdo
          const { error: updateError } = await supabase
            .from('library_materials')
            .update({ content: content })
            .eq('id', material.id);
          
          if (updateError) {
            console.error(`Erro ao atualizar ${material.title}:`, updateError);
            failedCount++;
          } else {
            console.log(`✓ Importado: ${material.title}`);
            successCount++;
          }
        } catch (err) {
          console.error(`Erro ao processar ${material.title}:`, err);
          failedCount++;
        }
      }
      
      setImportResults({ success: successCount, failed: failedCount });
      
      if (successCount > 0) {
        toast.success(`${successCount} materiais importados com sucesso!`);
      }
      if (failedCount > 0) {
        toast.warning(`${failedCount} materiais não puderam ser importados (sem arquivo correspondente).`);
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('Erro ao importar conteúdo dos materiais');
    } finally {
      setImporting(false);
    }
  };
  const handleGeneratePdf = async (material: Material, folder: string, preview = false) => {
    const stateFunc = preview ? setPreviewing : setLoading;
    stateFunc(material.id);
    
    try {
      // Carregar o conteúdo do arquivo
      const response = await fetch(`/materials/${folder}/${material.filename}`);
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
      case 'Apologética': return 'bg-red-500/20 text-red-700';
      case 'Estudos Interdisciplinares': return 'bg-indigo-500/20 text-indigo-700';
      case 'Filosofia': return 'bg-cyan-500/20 text-cyan-700';
      case 'História': return 'bg-amber-500/20 text-amber-700';
      case 'Psicologia': return 'bg-pink-500/20 text-pink-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-serif">
              Materiais Didáticos
            </h1>
            <p className="text-muted-foreground mt-2">
              Gere PDFs formatados com a identidade visual do P.O.D Seminário Teológico
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleImportContent}
              disabled={importing}
              className="gap-2"
              variant="default"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {importing ? 'Importando...' : 'Importar Conteúdo dos TXT'}
            </Button>
            
            {importResults && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-muted-foreground">
                  {importResults.success} importados, {importResults.failed} sem arquivo
                </span>
              </div>
            )}
          </div>
        </div>

        {MATERIAL_GROUPS.map((group) => (
          <div key={group.name} className="space-y-4">
            <h2 className="text-xl font-bold text-foreground font-serif border-b pb-2">
              {group.name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({group.materials.length} materiais)
              </span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.materials.map((material) => (
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
                      {group.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleGeneratePdf(material, group.folder, true)}
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
                      onClick={() => handleGeneratePdf(material, group.folder, false)}
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
        ))}
      </div>
    </AdminLayout>
  );
}
