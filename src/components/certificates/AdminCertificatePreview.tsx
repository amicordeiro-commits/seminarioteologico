import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificateTemplate } from "@/components/certificates/CertificateTemplate";
import type { CertificateStyle } from "@/components/certificates/CertificateTemplate";
import { useDownloadCertificate } from "@/hooks/useDownloadCertificate";
import { Download, Loader2, Sparkles, User } from "lucide-react";

export interface AdminCertificateWithDetails {
  id: string;
  certificate_number: string;
  issued_at: string;
  user_id: string;
  courses: {
    title: string;
    instructor?: string | null;
    duration_hours?: number | null;
  } | null;
}

interface AdminCertificatePreviewProps {
  certificate: AdminCertificateWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminCertificatePreview({
  certificate,
  open,
  onOpenChange,
}: AdminCertificatePreviewProps) {
  const [selectedStyle, setSelectedStyle] = useState<CertificateStyle>("golden");
  const { downloadCertificate, isDownloading } = useDownloadCertificate();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["admin-certificate-profile", certificate.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", certificate.user_id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: open && !!certificate.user_id,
    staleTime: 60_000,
  });

  const studentName = useMemo(() => {
    if (profile?.full_name) return profile.full_name;
    const shortId = certificate.user_id?.slice(0, 8);
    return shortId ? `Aluno ${shortId}…` : "Aluno";
  }, [profile?.full_name, certificate.user_id]);

  const courseName = certificate.courses?.title || "Curso Concluído";
  const instructorName = certificate.courses?.instructor || "Instrutor";
  const durationHours = certificate.courses?.duration_hours || 0;
  const completionDate = certificate.issued_at || new Date().toISOString();

  const styles: { value: CertificateStyle; label: string; description: string }[] = [
    { value: "elegant", label: "Elegante", description: "Sofisticado com tons de azul marinho e dourado" },
    { value: "royal", label: "Real", description: "Luxuoso com roxo profundo e detalhes dourados" },
    { value: "minimal", label: "Minimalista", description: "Limpo e moderno com muito espaço em branco" },
    { value: "executive", label: "Executivo", description: "Profissional com tons de verde escuro" },
    { value: "golden", label: "Dourado", description: "Clássico elegante com fundo creme e dourado" },
  ];

  const handleDownload = () => {
    downloadCertificate({ certificateId: certificate.id, style: selectedStyle });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Visualizar Certificado
          </DialogTitle>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <User className="w-4 h-4" />
              {isLoadingProfile ? "Carregando aluno…" : studentName}
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span className="font-medium text-foreground/90">{courseName}</span>
          </div>
        </DialogHeader>

        <Tabs value={selectedStyle} onValueChange={(v) => setSelectedStyle(v as CertificateStyle)}>
          <TabsList className="grid grid-cols-5 mb-6">
            {styles.map((style) => (
              <TabsTrigger key={style.value} value={style.value} className="flex flex-col gap-0.5">
                <span>{style.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {styles.map((style) => (
            <TabsContent key={style.value} value={style.value} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">{style.description}</p>
              <div className="border border-border rounded-xl overflow-hidden shadow-lg">
                <CertificateTemplate
                  style={style.value}
                  studentName={studentName}
                  courseName={courseName}
                  instructorName={instructorName}
                  completionDate={completionDate}
                  certificateNumber={certificate.certificate_number}
                  durationHours={durationHours}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button className="flex-1 gap-2" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? "Gerando…" : "Baixar PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
