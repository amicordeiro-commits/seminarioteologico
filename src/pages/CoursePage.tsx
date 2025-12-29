import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Clock,
  BookOpen,
  Star,
  CheckCircle2,
  PlayCircle,
  ArrowLeft,
  Download,
  Share2,
  Cross,
  BookMarked,
  Loader2,
  UserPlus,
  FileText,
  ExternalLink,
  File,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCourse, useEnrollment, useEnrollInCourse, useLessonProgress, useMarkLessonComplete } from "@/hooks/useCourses";
import { useQuizzes, useQuizAttempts } from "@/hooks/useQuizzes";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LessonViewer } from "@/components/courses/LessonViewer";

// Mapeamento de títulos de lições para URLs de arquivos no storage
const LESSON_STORAGE_URLS: Record<string, string> = {};

// Mapeamento de títulos de lições para arquivos .txt locais (fallback)
const LESSON_FILES: Record<string, { folder: string; filename: string }> = {
  // Bacharel - 33 disciplinas
  "Administração Eclesiástica": { folder: "bacharel", filename: "administracao_eclesiastica.txt" },
  "Teologia do Antigo Testamento": { folder: "bacharel", filename: "antigo_testamento.txt" },
  "Antigo Testamento": { folder: "bacharel", filename: "antigo_testamento.txt" },
  "Arqueologia Bíblica": { folder: "bacharel", filename: "arqueologia_biblica.txt" },
  "Bibliologia": { folder: "bacharel", filename: "bibliologia.txt" },
  "O Culto Bíblico": { folder: "bacharel", filename: "culto_biblico.txt" },
  "Culto Bíblico": { folder: "bacharel", filename: "culto_biblico.txt" },
  "Doutrinas Bíblicas": { folder: "bacharel", filename: "doutrinas_biblicas.txt" },
  "Educação Cristã": { folder: "bacharel", filename: "educacao_crista.txt" },
  "Estatutos da Igreja": { folder: "bacharel", filename: "estatutos_igreja.txt" },
  "Ética Cristã": { folder: "bacharel", filename: "etica.txt" },
  "Ética": { folder: "bacharel", filename: "etica.txt" },
  "Evangelismo Pessoal": { folder: "bacharel", filename: "evangelismo_pessoal.txt" },
  "Teologia Pastoral": { folder: "bacharel", filename: "teologia_pastoral.txt" },
  // Novas disciplinas do Bacharel
  "Escatologia": { folder: "bacharel", filename: "escatologia.txt" },
  "Ofícios Eclesiásticos": { folder: "bacharel", filename: "oficios.txt" },
  "Oratória": { folder: "bacharel", filename: "oratoria.txt" },
  "Ordenação Pastoral": { folder: "bacharel", filename: "ordenacao_pastoral.txt" },
  "Pneumatologia": { folder: "bacharel", filename: "pneumatologia.txt" },
  "Psicologia da Educação Cristã": { folder: "bacharel", filename: "psicologia_educaco_crista.txt" },
  "Psicologia Pastoral": { folder: "bacharel", filename: "psicologia_pastoral.txt" },
  "Responsabilidade Social da Igreja": { folder: "bacharel", filename: "responsabilidade_social_igreja.txt" },
  "Soteriologia": { folder: "bacharel", filename: "soteriologia.txt" },
  "Cristologia": { folder: "bacharel", filename: "cristologia.txt" },
  // Outras disciplinas do Bacharel
  "Exegese Bíblica": { folder: "bacharel", filename: "exegese_biblica.txt" },
  "Filosofia Cristã": { folder: "bacharel", filename: "filosofia.txt" },
  "Geografia Bíblica": { folder: "bacharel", filename: "geografia_biblica.txt" },
  "Hermenêutica Bíblica": { folder: "bacharel", filename: "hermeneutica.txt" },
  "História do Cristianismo": { folder: "bacharel", filename: "historia_cristianismo.txt" },
  "Homilética I": { folder: "bacharel", filename: "homiletica1.txt" },
  "Homilética II": { folder: "bacharel", filename: "homiletica2.txt" },
  "Igreja e Direitos Humanos": { folder: "bacharel", filename: "igreja_direitos_humanos.txt" },
  "Liderança Cristã": { folder: "bacharel", filename: "lideranca.txt" },
  "Ministérios Eclesiásticos": { folder: "bacharel", filename: "ministerios_eclesiasticos.txt" },
  "Missiologia": { folder: "bacharel", filename: "missiologia.txt" },
  "Teologia do Novo Testamento": { folder: "bacharel", filename: "novo_testamento.txt" },
  // Doutorado (18 materiais)
  "Apologética do Antigo Testamento": { folder: "doutorado", filename: "apologetica_at.txt" },
  "Apologética AT": { folder: "doutorado", filename: "apologetica_at.txt" },
  "Apologética do Novo Testamento": { folder: "doutorado", filename: "apologetica_nt.txt" },
  "Apologética NT": { folder: "doutorado", filename: "apologetica_nt.txt" },
  "Capelania Evangélica": { folder: "doutorado", filename: "capelania_evangelica.txt" },
  "Capelania": { folder: "doutorado", filename: "capelania_evangelica.txt" },
  "Direito e Religião": { folder: "doutorado", filename: "direito_religiao.txt" },
  "Ética Cristã Avançada": { folder: "doutorado", filename: "etica_crista.txt" },
  "Exegese": { folder: "doutorado", filename: "exegese_biblica.txt" },
  "Fenomenologia da Religião": { folder: "doutorado", filename: "fenomenologia_religiao.txt" },
  "Fenomenologia": { folder: "doutorado", filename: "fenomenologia_religiao.txt" },
  "Filosofia da Educação": { folder: "doutorado", filename: "filosofia_educacao.txt" },
  "Hermenêutica": { folder: "doutorado", filename: "hermeneutica_biblica.txt" },
  "História da Igreja": { folder: "doutorado", filename: "historia_igreja.txt" },
  "Homilética Narrativa": { folder: "doutorado", filename: "homiletica_narrativa.txt" },
  "Homilética": { folder: "doutorado", filename: "homiletica_narrativa.txt" },
  "Liturgia": { folder: "doutorado", filename: "liturgia.txt" },
  "Psicologia Geral": { folder: "doutorado", filename: "psicologia_geral.txt" },
  "Sociologia e Antropologia da Religião": { folder: "doutorado", filename: "sociologia_antropologia_religiao.txt" },
  "Sociologia da Religião": { folder: "doutorado", filename: "sociologia_antropologia_religiao.txt" },
  "Temas Atuais da Teologia": { folder: "doutorado", filename: "temas_atuais_teologia.txt" },
  "Temas Atuais": { folder: "doutorado", filename: "temas_atuais_teologia.txt" },
  "Teologia Espiritual": { folder: "doutorado", filename: "teologia_espiritual.txt" },
};

const CoursePage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [showMaterials, setShowMaterials] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

  // In-app material viewer (avoids browser extensions blocking direct PDF navigation)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTitle, setViewerTitle] = useState<string>("");
  const [viewerBlobUrl, setViewerBlobUrl] = useState<string | null>(null);
  const [viewerText, setViewerText] = useState<string | null>(null);
  const [viewerKind, setViewerKind] = useState<"pdf" | "text">("pdf");
  const [viewerLoading, setViewerLoading] = useState(false);

  const { data: course, isLoading: loadingCourse } = useCourse(id || "");
  const { data: enrollment, isLoading: loadingEnrollment } = useEnrollment(id || "");
  const { data: lessonProgress } = useLessonProgress(id || "");
  const { data: quizzes = [] } = useQuizzes(id || "");
  const { data: quizAttempts = [] } = useQuizAttempts();
  const enrollMutation = useEnrollInCourse();
  const markCompleteMutation = useMarkLessonComplete();

  // Fetch course materials
  const { data: courseMaterials = [], isLoading: loadingMaterials } = useQuery({
    queryKey: ["course-materials", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_materials")
        .select("*")
        .eq("is_published", true)
        .or(`course_id.eq.${id},course_id.is.null`)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!enrollment,
  });

  const handleEnroll = async () => {
    if (!id) return;
    try {
      await enrollMutation.mutateAsync(id);
      toast({
        title: "Matrícula realizada!",
        description: "Você foi matriculado no curso com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível realizar a matrícula.",
        variant: "destructive",
      });
    }
  };

  const handleMarkComplete = async (lessonId: string) => {
    if (!id) return;
    try {
      await markCompleteMutation.mutateAsync({ lessonId, courseId: id });
      toast({
        title: "Aula concluída!",
        description: "Seu progresso foi salvo.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a aula como concluída.",
        variant: "destructive",
      });
    }
  };

  const resetViewer = () => {
    if (viewerBlobUrl) URL.revokeObjectURL(viewerBlobUrl);
    setViewerBlobUrl(null);
    setViewerText(null);
    setViewerTitle("");
    setViewerLoading(false);
  };

  useEffect(() => {
    return () => {
      if (viewerBlobUrl) URL.revokeObjectURL(viewerBlobUrl);
    };
  }, [viewerBlobUrl]);

  const handleViewerOpenChange = (open: boolean) => {
    if (!open) resetViewer();
    setViewerOpen(open);
  };

  const handleOpenMaterial = async (material: any) => {
    const url = material?.file_url as string | null;
    if (!url) {
      toast({
        title: "Material indisponível",
        description: "Este item não possui um arquivo associado.",
        variant: "destructive",
      });
      return;
    }

    const cleanUrl = url.split("?")[0];
    const ext = cleanUrl.split(".").pop()?.toLowerCase();
    const fileType = (material?.file_type as string | null)?.toLowerCase();
    const isPdf = fileType === "pdf" || ext === "pdf";
    const isText = fileType === "txt" || fileType === "text" || ext === "txt";

    // Open viewer immediately (so pop-up blockers don't interfere)
    setViewerTitle(material?.title || "Material");
    setViewerKind(isText ? "text" : "pdf");
    setViewerOpen(true);
    setViewerLoading(true);

    try {
      // Some Chrome extensions block direct navigation to /materials/*.pdf.
      // Fetching and opening as blob usually bypasses that.
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      if (isText) {
        const text = await res.text();
        setViewerText(text);
      } else {
        const blob = await res.blob();
        if (viewerBlobUrl) URL.revokeObjectURL(viewerBlobUrl);
        const blobUrl = URL.createObjectURL(blob);
        setViewerBlobUrl(blobUrl);
      }
    } catch (e) {
      resetViewer();
      setViewerOpen(false);
      toast({
        title: "Não foi possível abrir o material",
        description:
          "Seu navegador/extensão pode estar bloqueando o arquivo. Tente janela anônima ou desative bloqueadores.",
        variant: "destructive",
      });
    } finally {
      setViewerLoading(false);
    }
  };

  // Abre material da lição
  const handleOpenLesson = async (lesson: any) => {
    setViewerTitle(lesson.title);
    setViewerKind("text");
    setViewerOpen(true);
    setViewerLoading(true);

    try {
      // 1) Primeiro tenta buscar do banco/arquivo local (fallback)
      const rawText = await fetchMaterialFromDb(lesson.title);
      if (rawText) {
        setViewerText(rawText);
        setViewerLoading(false);
        return;
      }

      // 2) Se não achou, tenta correspondência por título na biblioteca (mais flexível)
      const normalizeTitle = (title: string) =>
        title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s]/g, "")
          .trim();

      const lessonNormalized = normalizeTitle(lesson.title);
      const lessonWords = lessonNormalized.split(" ").filter((w) => w.length > 2);

      const { data: materials } = await supabase
        .from("library_materials")
        .select("file_url, content, title")
        .eq("category", "Bacharel")
        .not("file_url", "is", null);

      let matchingMaterial = materials?.find((m) => {
        if (!m.title) return false;
        const materialNormalized = normalizeTitle(m.title);
        const matchCount = lessonWords.filter((word) => materialNormalized.includes(word)).length;
        return matchCount >= 1;
      });

      if (!matchingMaterial && materials) {
        const firstWord = lessonWords[0];
        matchingMaterial = materials.find((m) => normalizeTitle(m.title || "").includes(firstWord));
      }

      if (matchingMaterial?.file_url) {
        console.log("Buscando material:", matchingMaterial.title, matchingMaterial.file_url);
        const res = await fetch(matchingMaterial.file_url, { cache: "no-store" });
        if (res.ok) {
          const text = await res.text();
          if (!text.trim().startsWith("<!") && !text.trim().startsWith("<html")) {
            setViewerText(text);
            setViewerLoading(false);
            return;
          }
        }
      }

      console.log("Material não encontrado para:", lesson.title);
      throw new Error("Material não encontrado");
    } catch (e) {
      console.error("Erro ao carregar material:", e);
      resetViewer();
      setViewerOpen(false);
      toast({
        title: "Material não disponível",
        description: `O conteúdo de "${lesson.title}" ainda não foi carregado.`,
        variant: "destructive",
      });
    } finally {
      setViewerLoading(false);
    }
  };

  // Função para converter texto em HTML formatado
  const formatContentToHtml = (text: string): string => {
    if (!text) return "";
    
    return text
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s\d\-:,]+)$/gm, (match) => {
        if (match.length > 60) return match;
        return `<h2>${match.trim()}</h2>`;
      })
      .split("\n\n")
      .map(paragraph => {
        paragraph = paragraph.trim();
        if (!paragraph) return "";
        if (paragraph.startsWith("<h")) return paragraph;
        paragraph = paragraph.replace(/\(([A-Za-z]+\s*\d+[:.]\d+(?:-\d+)?)\)/g, '<em>($1)</em>');
        return `<p>${paragraph}</p>`;
      })
      .join("\n");
  };

  // Função para buscar conteúdo do material do banco de dados
  const fetchMaterialFromDb = async (title: string): Promise<string> => {
    try {
      // Buscar material do banco de dados
      const { data, error } = await supabase
        .from("library_materials")
        .select("content, file_url")
        .eq("title", title)
        .not("content", "is", null)
        .limit(1)
        .maybeSingle();

      if (data?.content) {
        return data.content;
      }

      // Se não tem content no banco, tenta buscar do arquivo
      if (data?.file_url && data.file_url.endsWith(".txt")) {
        const res = await fetch(data.file_url, { cache: "no-store" });
        if (res.ok) {
          return await res.text();
        }
      }

      // Fallback: tentar arquivo local
      const lessonFile = LESSON_FILES[title];
      if (lessonFile) {
        const url = `/materials/${lessonFile.folder}/${lessonFile.filename}`;
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          return await res.text();
        }
      }

      return "";
    } catch {
      return "";
    }
  };

  // Função para baixar PDF formatado da aula
  const handleDownloadLessonPdf = async (lesson: any) => {
    setGeneratingPdf(lesson.id);
    
    try {
      toast({
        title: "Carregando material...",
        description: "Aguarde enquanto preparamos o PDF.",
      });

      const rawText = await fetchMaterialFromDb(lesson.title);
      
      if (!rawText) {
        toast({
          title: "Material não disponível",
          description: "O conteúdo desta aula não foi encontrado.",
          variant: "destructive",
        });
        setGeneratingPdf(null);
        return;
      }

      const content = formatContentToHtml(rawText.substring(0, 50000));

      const { data, error } = await supabase.functions.invoke("generate-branded-pdf", {
        body: {
          title: lesson.title,
          category: course?.category || "Material Didático",
          content: content,
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.html) throw new Error("Falha ao gerar o PDF.");

      const popup = window.open("", "_blank");
      
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        const blob = new Blob([data.html], { type: "text/html" });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${lesson.title.replace(/[^a-zA-Z0-9]/g, "_")}_POD.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        
        toast({
          title: "Arquivo baixado!",
          description: "Abra no navegador e use Ctrl+P para salvar como PDF.",
        });
        return;
      }

      popup.document.open();
      popup.document.write(data.html);
      popup.document.close();

      await new Promise((r) => setTimeout(r, 700));
      popup.focus();
      popup.print();

      toast({
        title: "PDF gerado!",
        description: "Use a janela de impressão para salvar o PDF.",
      });
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF desta aula.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(null);
    }
  };

  if (loadingCourse || loadingEnrollment) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-serif font-semibold text-foreground">Curso não encontrado</h2>
          <Button asChild className="mt-4">
            <Link to="/courses">Voltar aos cursos</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const completedLessonsCount = lessonProgress?.filter(p => p.completed).length || 0;
  const totalLessons = course.lessons?.length || course.total_lessons || 1;
  const progressPercentage = enrollment ? (completedLessonsCount / totalLessons) * 100 : 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/courses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos cursos
          </Link>
        </Button>

        {/* Course Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800'}
                alt={course.title}
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Cross className="w-4 h-4 text-accent" />
                  <Badge className="bg-accent text-accent-foreground font-sans">{course.category}</Badge>
                  <Badge variant="secondary" className="font-sans capitalize">{course.level}</Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground mb-2">
                  {course.title}
                </h1>
                <p className="text-primary-foreground/80 font-sans">{course.instructor}</p>
              </div>
              {enrollment && (
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-glow hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-primary-foreground ml-1" />
                </button>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed font-sans">{course.description}</p>

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-serif font-semibold text-foreground">{course.duration_hours}h</p>
                <p className="text-sm text-muted-foreground font-sans">Duração</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-serif font-semibold text-foreground">{totalLessons}</p>
                <p className="text-sm text-muted-foreground font-sans">Aulas</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <Star className="w-6 h-6 fill-warning text-warning mx-auto mb-2" />
                <p className="font-serif font-semibold text-foreground">4.8</p>
                <p className="text-sm text-muted-foreground font-sans">Avaliação</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                <p className="font-serif font-semibold text-foreground">{completedLessonsCount}</p>
                <p className="text-sm text-muted-foreground font-sans">Concluídas</p>
              </div>
            </div>

            {/* Lessons */}
            {course.lessons && course.lessons.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-semibold text-foreground">Conteúdo Programático</h2>
                <Accordion type="single" collapsible defaultValue="lessons" className="space-y-3">
                  <AccordionItem
                    value="lessons"
                    className="border border-border rounded-xl overflow-hidden bg-card"
                  >
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-secondary/50">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-serif font-semibold">
                          1
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-serif font-medium text-foreground">Módulo Principal</h3>
                          <p className="text-sm text-muted-foreground font-sans">
                            {completedLessonsCount}/{course.lessons.length} aulas • {course.duration_hours}h
                          </p>
                        </div>
                        {completedLessonsCount === course.lessons.length && (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4">
                      <div className="space-y-2 pt-2 border-t border-border">
                        {course.lessons.map((lesson) => {
                          const isCompleted = lessonProgress?.some(
                            (p) => p.lesson_id === lesson.id && p.completed
                          );

                          const canOpen = !!enrollment;

                          return (
                            <div key={lesson.id} className="flex items-center gap-2">
                              <button
                                onClick={() => canOpen && handleOpenLesson(lesson)}
                                disabled={!canOpen}
                                className={cn(
                                  "flex-1 flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left group font-sans",
                                  isCompleted
                                    ? "bg-success/10"
                                    : canOpen
                                      ? "hover:bg-secondary cursor-pointer"
                                      : "opacity-50 cursor-not-allowed"
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                    isCompleted
                                      ? "bg-success text-success-foreground"
                                      : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                  )}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <BookOpen className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p
                                    className={cn(
                                      "text-sm font-medium",
                                      isCompleted
                                        ? "text-muted-foreground line-through"
                                        : "text-foreground"
                                    )}
                                  >
                                    {lesson.title}
                                  </p>
                                  {lesson.description && (
                                    <p className="text-xs text-muted-foreground">{lesson.description}</p>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {lesson.duration_minutes}min
                                </span>
                                {lesson.is_free && (
                                  <Badge variant="secondary" className="text-xs">
                                    Grátis
                                  </Badge>
                                )}
                              </button>
                              {/* Botão para visualizar PDF - disponível para todas as aulas */}
                              {enrollment && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadLessonPdf(lesson);
                                  }}
                                  disabled={generatingPdf === lesson.id}
                                  className="text-xs gap-1"
                                  title="Visualizar PDF"
                                >
                                  {generatingPdf === lesson.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <FileDown className="w-4 h-4" />
                                  )}
                                  Visualizar
                                </Button>
                              )}
                              {enrollment && !isCompleted && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkComplete(lesson.id)}
                                  disabled={markCompleteMutation.isPending}
                                  className="text-xs text-muted-foreground hover:text-success"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {/* Materials Section - visible for enrolled users */}
            {enrollment && (
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-semibold text-foreground flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Materiais de Estudo
                </h2>
                {loadingMaterials ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : courseMaterials.length === 0 ? (
                  <div className="p-6 rounded-xl bg-card border border-border text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhum material disponível para este curso.</p>
                    <Button variant="outline" asChild className="mt-4">
                      <Link to="/library">Acessar Biblioteca Completa</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {courseMaterials.slice(0, 6).map((material) => (
                      <div
                        key={material.id}
                        className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <File className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">{material.title}</h4>
                            {material.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {material.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {material.category || "Geral"}
                              </Badge>
                              {material.file_type && (
                                <Badge variant="outline" className="text-xs uppercase">
                                  {material.file_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {material.file_url ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="shrink-0"
                              onClick={() => handleOpenMaterial(material)}
                            >
                              Abrir
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground shrink-0">Sem arquivo</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {courseMaterials.length > 6 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowMaterials(true)}
                      >
                        Ver todos os {courseMaterials.length} materiais
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quizzes Section */}
            {quizzes.length > 0 && enrollment && (
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Avaliações
                </h2>
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      attempts={quizAttempts.filter((a) => a.quiz_id === quiz.id)}
                      onStart={setActiveQuizId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Progress Card */}
            <div className="p-6 rounded-xl bg-card border border-border sticky top-24">
              <h3 className="font-serif font-semibold text-foreground mb-4">
                {enrollment ? 'Seu Progresso' : 'Matricule-se'}
              </h3>
              
              {enrollment ? (
                <>
                  <div className="text-center mb-6">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="12"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="12"
                          strokeDasharray={`${progressPercentage * 3.52} 352`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-serif font-bold text-foreground">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground font-sans">
                      {completedLessonsCount} de {totalLessons} aulas concluídas
                    </p>
                  </div>

                  <Button variant="hero" size="lg" className="w-full mb-3">
                    <Play className="w-5 h-5 mr-2" />
                    Continuar Curso
                  </Button>
                </>
              ) : (
                <div className="text-center mb-6">
                  <p className="text-muted-foreground font-sans mb-4">
                    Matricule-se para ter acesso ao conteúdo completo do curso.
                  </p>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-5 h-5 mr-2" />
                    )}
                    Matricular-se Agora
                  </Button>
                </div>
              )}

              {enrollment && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setShowMaterials(true)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Materiais
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="w-4 h-4 mr-1" />
                    Compartilhar
                  </Button>
                </div>
              )}

              {/* Instructor */}
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 font-sans">Instrutor</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-serif font-semibold">
                      {course.instructor?.split(" ").map((n) => n[0]).join("").slice(0, 2) || 'IN'}
                    </span>
                  </div>
                  <div>
                    <p className="font-serif font-medium text-foreground">{course.instructor || 'Instrutor'}</p>
                    <p className="text-sm text-muted-foreground font-sans">Especialista em {course.category}</p>
                  </div>
                </div>
              </div>

              {/* Scripture Reference */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <BookMarked className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent font-sans">Versículo Base</span>
                </div>
                <p className="text-sm text-muted-foreground italic font-sans leading-relaxed">
                  "Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade."
                </p>
                <p className="text-xs text-muted-foreground/70 mt-2 font-sans">2 Timóteo 2:15</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Quiz Dialog */}
      <Dialog open={!!activeQuizId} onOpenChange={() => setActiveQuizId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Quiz</DialogTitle>
          </DialogHeader>
          {activeQuizId && (
            <QuizPlayer
              quizId={activeQuizId}
              onComplete={() => {}}
              onClose={() => setActiveQuizId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Materials Dialog */}
      <Dialog open={showMaterials} onOpenChange={setShowMaterials}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Materiais do Curso
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {loadingMaterials ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : courseMaterials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum material disponível para este curso.</p>
                <p className="text-sm mt-2">Acesse a Biblioteca para ver todos os materiais.</p>
                <Button variant="outline" asChild className="mt-4">
                  <Link to="/library">Ver Biblioteca</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {courseMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <File className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{material.title}</h4>
                        {material.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {material.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {material.category || "Geral"}
                          </Badge>
                          {material.file_type && (
                            <Badge variant="outline" className="text-xs uppercase">
                              {material.file_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {material.file_url ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="shrink-0"
                          onClick={() => handleOpenMaterial(material)}
                        >
                          Abrir
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground shrink-0">Sem arquivo</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Lesson Viewer - Novo componente melhorado */}
      <LessonViewer
        open={viewerOpen}
        onOpenChange={handleViewerOpenChange}
        title={viewerTitle}
        content={viewerText}
        loading={viewerLoading}
        category={course?.category}
      />
    </AppLayout>
  );
};

export default CoursePage;
