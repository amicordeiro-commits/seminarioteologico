import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Download, 
  Calendar,
  BookOpen,
  Clock,
  ExternalLink,
  Loader2,
  GraduationCap
} from "lucide-react";
import { useCertificates, Certificate } from "@/hooks/useCertificates";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { useDownloadCertificate } from "@/hooks/useDownloadCertificate";

export default function CertificatesPage() {
  const { data: certificates = [], isLoading } = useCertificates();
  const [previewCertificate, setPreviewCertificate] = useState<Certificate | null>(null);
  const { downloadCertificate, isDownloading } = useDownloadCertificate();

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
            Meus Certificados
          </h1>
          <p className="text-muted-foreground">
            Seus certificados de conclusão de cursos
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{certificates.length}</p>
                <p className="text-sm text-muted-foreground">Certificados</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {certificates.reduce((acc, c) => acc + (c.course?.duration_hours || 0), 0)}h
                </p>
                <p className="text-sm text-muted-foreground">Horas de Estudo</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{certificates.length}</p>
                <p className="text-sm text-muted-foreground">Cursos Concluídos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Certificates Grid */}
        {!isLoading && certificates.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Certificate Header - Visual */}
                <div className="bg-gradient-to-r from-primary via-primary/90 to-accent p-6 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-24 h-24 border-4 border-white/30 rounded-full" />
                    <div className="absolute bottom-4 left-4 w-16 h-16 border-4 border-white/20 rounded-full" />
                  </div>
                  <div className="relative z-10 text-center">
                    <Award className="w-12 h-12 text-white/90 mx-auto mb-3" />
                    <h3 className="text-lg font-serif font-bold text-white">
                      Certificado de Conclusão
                    </h3>
                    <p className="text-white/70 text-sm mt-1">
                      Seminário Teológico Online
                    </p>
                  </div>
                </div>

                {/* Certificate Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-serif font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {certificate.course?.title || "Curso Concluído"}
                    </h4>
                    {certificate.course?.instructor && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Instrutor: {certificate.course.instructor}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(certificate.issued_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                    </Badge>
                    {certificate.course?.duration_hours && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        {certificate.course.duration_hours}h
                      </Badge>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">
                      Número do certificado: <span className="font-mono">{certificate.certificate_number}</span>
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => setPreviewCertificate(certificate)}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visualizar
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => downloadCertificate({ certificateId: certificate.id })}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {isDownloading ? "Gerando..." : "Baixar PDF"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && certificates.length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-serif font-semibold text-foreground">
              Nenhum certificado ainda
            </h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Complete seus cursos para receber certificados de conclusão que comprovam seu aprendizado.
            </p>
            <Button className="mt-6" asChild>
              <a href="/courses">Explorar Cursos</a>
            </Button>
          </div>
        )}

        {/* Certificate Preview Dialog */}
        {previewCertificate && (
          <CertificatePreview
            certificate={previewCertificate}
            open={!!previewCertificate}
            onOpenChange={(open) => !open && setPreviewCertificate(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
