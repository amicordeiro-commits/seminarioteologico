import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { CertificateStyle } from "@/components/certificates/CertificateTemplate";

interface DownloadCertificateParams {
  certificateId: string;
  style?: CertificateStyle;
}

export function useDownloadCertificate() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCertificate = async ({ certificateId, style = "premium" }: DownloadCertificateParams) => {
    setIsDownloading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-certificate-pdf", {
        body: { certificateId, style },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.html) {
        throw new Error("Failed to generate certificate HTML");
      }

      // Create a temporary container to render the HTML
      const container = document.createElement("div");
      container.innerHTML = data.html;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      document.body.appendChild(container);

      // Wait for fonts and styles to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Find the certificate element
      const certificateElement = container.querySelector(".certificate") as HTMLElement;
      
      if (!certificateElement) {
        throw new Error("Certificate element not found");
      }

      // Generate canvas from the certificate HTML
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      // Create PDF with landscape orientation
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [842, 595],
      });

      // Add the canvas as an image
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, 842, 595);

      // Download the PDF
      const fileName = `certificado-${data.courseName?.replace(/\s+/g, "-").toLowerCase() || "curso"}-${data.certificateNumber}.pdf`;
      pdf.save(fileName);

      // Clean up
      document.body.removeChild(container);

      toast.success("Certificado baixado com sucesso!");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error("Erro ao baixar o certificado. Tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadCertificate, isDownloading };
}
