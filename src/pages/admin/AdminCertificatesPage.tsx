import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GraduationCap, Loader2, Calendar, RefreshCw, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CertificateWithDetails {
  id: string;
  certificate_number: string;
  issued_at: string;
  user_id: string;
  course_id: string;
  courses: { title: string } | null;
}

export default function AdminCertificatesPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select(
          `
          *,
          courses (title)
        `
        )
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return data as CertificateWithDetails[];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const certificates: CertificateWithDetails[] = Array.isArray(data)
    ? (data as CertificateWithDetails[])
    : [];

  const errorMessage =
    error instanceof Error ? error.message : "Não foi possível carregar os certificados.";

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Certificados Emitidos
            </h1>
            <p className="text-muted-foreground mt-1">
              {certificates.length} certificados emitidos
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Atualizar
          </Button>
        </div>

        {/* Certificates List */}
        {isError ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar certificados</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <p className="break-words">{errorMessage}</p>
              <div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : certificates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum certificado emitido ainda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <Card key={cert.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      {cert.courses?.title || "Curso não encontrado"}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      Emitido
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(cert.issued_at), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground font-mono">
                      {cert.certificate_number}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
