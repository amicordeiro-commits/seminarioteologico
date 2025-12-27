import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificateTemplate, CertificateStyle } from "./CertificateTemplate";
import { Download, Eye, Sparkles, Loader2 } from "lucide-react";
import { Certificate } from "@/hooks/useCertificates";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useDownloadCertificate } from "@/hooks/useDownloadCertificate";

interface CertificatePreviewProps {
  certificate: Certificate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CertificatePreview({ certificate, open, onOpenChange }: CertificatePreviewProps) {
  const [selectedStyle, setSelectedStyle] = useState<CertificateStyle>("golden");
  const { user } = useAuth();
  const { profile } = useProfile();
  const { downloadCertificate, isDownloading } = useDownloadCertificate();

  const studentName = profile?.full_name || user?.email?.split("@")[0] || "Estudante";

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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Escolha o Modelo do Certificado
          </DialogTitle>
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
                  courseName={certificate.course?.title || "Curso Concluído"}
                  instructorName={certificate.course?.instructor || "Instrutor"}
                  completionDate={certificate.issued_at}
                  certificateNumber={certificate.certificate_number}
                  durationHours={certificate.course?.duration_hours || 0}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => onOpenChange(false)}>
            <Eye className="w-4 h-4" />
            Fechar
          </Button>
          <Button 
            className="flex-1 gap-2" 
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isDownloading ? "Gerando..." : "Baixar Certificado"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
