import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CertificateStyle } from "@/components/certificates/CertificateTemplate";

interface DownloadCertificateParams {
  certificateId: string;
  style?: CertificateStyle;
}

export function useDownloadCertificate() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCertificate = async ({
    certificateId,
    style = "premium",
  }: DownloadCertificateParams) => {
    setIsDownloading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-certificate-pdf", {
        body: { certificateId, style },
      });

      if (error) throw new Error(error.message);
      if (!data?.html) throw new Error("Falha ao gerar o certificado.");

      // Abre o HTML em uma nova aba e usa o diálogo nativo de impressão (Salvar como PDF)
      const popup = window.open("", "_blank", "noopener,noreferrer");
      if (!popup) throw new Error("Popup bloqueado. Permita popups para baixar o PDF.");

      popup.document.open();
      popup.document.write(data.html);
      popup.document.close();

      // Dá um pequeno tempo para fontes/estilos carregarem antes de imprimir
      await new Promise((r) => setTimeout(r, 700));
      popup.focus();
      popup.print();

      toast.message("Abrimos o certificado para você salvar como PDF.");
    } catch (err) {
      console.error("Error downloading certificate:", err);
      toast.error("Erro ao baixar o certificado. Tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadCertificate, isDownloading };
}

