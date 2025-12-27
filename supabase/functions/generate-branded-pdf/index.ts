import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cores do sistema (burgundy/wine com dourado)
const COLORS = {
  primary: "#6b2c3d", // --primary: 345 45% 28%
  primaryDark: "#4a1f2b", // --primary darker
  accent: "#d4a520", // --accent: 42 80% 50% (gold)
  text: "#2a1f1a", // --foreground: 20 25% 12%
  lightBg: "#faf8f5", // --background: 30 20% 98%
  muted: "#6b6460", // --muted-foreground
};

// Logo em base64 será carregada do storage ou inline
const INSTITUTION_NAME = "P.O.D Seminário Teológico";
const INSTITUTION_SUBTITLE = "Formando Líderes para o Reino de Deus";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, category, content, authorName } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Título é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gera o HTML do PDF com capa personalizada
    const html = generateBrandedPdfHtml({
      title,
      category: category || "Material Didático",
      content: content || "",
      authorName: authorName || "",
      date: new Date().toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
      }),
    });

    return new Response(
      JSON.stringify({ html, title }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating branded PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro ao gerar PDF";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface PdfOptions {
  title: string;
  category: string;
  content: string;
  authorName: string;
  date: string;
}

function generateBrandedPdfHtml(options: PdfOptions): string {
  const { title, category, content, authorName, date } = options;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${INSTITUTION_NAME}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: ${COLORS.text};
      background: white;
    }
    
    .cover-page {
      width: 210mm;
      height: 297mm;
      background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      page-break-after: always;
      overflow: hidden;
    }
    
    .cover-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 0v28H0v4h28v28h4V32h28v-4H32V0h-4z' fill='%23d4a520' fill-opacity='0.08'/%3E%3C/svg%3E");
      opacity: 0.5;
    }
    
    .cover-border {
      position: absolute;
      top: 15mm;
      left: 15mm;
      right: 15mm;
      bottom: 15mm;
      border: 2px solid ${COLORS.accent};
      border-radius: 4px;
    }
    
    .cover-corner {
      position: absolute;
      width: 30px;
      height: 30px;
      border: 3px solid ${COLORS.accent};
    }
    
    .cover-corner.top-left { top: 12mm; left: 12mm; border-right: none; border-bottom: none; }
    .cover-corner.top-right { top: 12mm; right: 12mm; border-left: none; border-bottom: none; }
    .cover-corner.bottom-left { bottom: 12mm; left: 12mm; border-right: none; border-top: none; }
    .cover-corner.bottom-right { bottom: 12mm; right: 12mm; border-left: none; border-top: none; }
    
    .cover-content {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 40px;
      max-width: 160mm;
    }
    
    .logo-container {
      margin-bottom: 40px;
    }
    
    .logo-placeholder {
      width: 120px;
      height: 120px;
      margin: 0 auto 20px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid ${COLORS.accent};
    }
    
    .logo-icon {
      font-size: 48px;
      color: ${COLORS.accent};
    }
    
    .institution-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28pt;
      font-weight: 700;
      color: white;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 8px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .institution-subtitle {
      font-size: 11pt;
      color: ${COLORS.accent};
      font-style: italic;
      margin-bottom: 60px;
      letter-spacing: 1px;
    }
    
    .divider {
      width: 80px;
      height: 2px;
      background: ${COLORS.accent};
      margin: 0 auto 40px;
    }
    
    .category-badge {
      display: inline-block;
      padding: 8px 24px;
      background: ${COLORS.accent};
      color: ${COLORS.primaryDark};
      font-size: 10pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-radius: 4px;
      margin-bottom: 30px;
    }
    
    .cover-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 32pt;
      font-weight: 700;
      color: white;
      line-height: 1.2;
      margin-bottom: 40px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .cover-meta {
      color: rgba(255,255,255,0.8);
      font-size: 10pt;
    }
    
    .cover-meta span {
      display: block;
      margin-bottom: 4px;
    }
    
    .cover-footer {
      position: absolute;
      bottom: 25mm;
      left: 0;
      right: 0;
      text-align: center;
      color: rgba(255,255,255,0.6);
      font-size: 9pt;
      z-index: 1;
    }
    
    /* Content pages */
    .content-page {
      width: 210mm;
      min-height: 297mm;
      padding: 25mm 25mm 30mm 25mm;
      background: white;
      position: relative;
    }
    
    .page-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 15mm;
      background: ${COLORS.primary};
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 25mm;
    }
    
    .page-header-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 10pt;
      color: white;
      font-weight: 600;
    }
    
    .page-header-institution {
      font-size: 9pt;
      color: ${COLORS.accent};
    }
    
    .header-bar {
      background: linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);
      height: 8px;
      margin: -25mm -25mm 20px -25mm;
      width: calc(100% + 50mm);
    }
    
    .header-accent {
      height: 3px;
      background: ${COLORS.accent};
      margin-top: -3px;
    }
    
    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .content-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .mini-logo {
      width: 40px;
      height: 40px;
      background: ${COLORS.primary};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${COLORS.accent};
      font-size: 16px;
    }
    
    .header-text {
      font-size: 9pt;
      color: ${COLORS.muted};
    }
    
    .header-text strong {
      color: ${COLORS.primary};
      font-family: 'Cormorant Garamond', serif;
      font-size: 11pt;
    }
    
    .content-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24pt;
      color: ${COLORS.primary};
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid ${COLORS.accent};
    }
    
    .content-body {
      font-size: 11pt;
      line-height: 1.8;
      text-align: justify;
    }
    
    .content-body h1, .content-body h2, .content-body h3 {
      font-family: 'Cormorant Garamond', serif;
      color: ${COLORS.primary};
      margin: 25px 0 15px 0;
    }
    
    .content-body h1 { font-size: 20pt; }
    .content-body h2 { font-size: 16pt; }
    .content-body h3 { font-size: 14pt; }
    
    .content-body p {
      margin-bottom: 12px;
    }
    
    .content-body ul, .content-body ol {
      margin: 15px 0;
      padding-left: 25px;
    }
    
    .content-body li {
      margin-bottom: 8px;
    }
    
    .content-body blockquote {
      margin: 20px 0;
      padding: 15px 20px;
      background: ${COLORS.lightBg};
      border-left: 4px solid ${COLORS.accent};
      font-style: italic;
      color: ${COLORS.muted};
    }
    
    .page-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 20mm;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-top: 1px solid #e5e5e5;
      padding: 0 25mm;
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      font-size: 8pt;
      color: ${COLORS.muted};
    }
    
    .footer-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .footer-divider {
      width: 1px;
      height: 15px;
      background: #ddd;
    }
    
    @media print {
      .cover-page {
        page-break-after: always;
      }
      
      .content-page {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-pattern"></div>
    <div class="cover-border"></div>
    <div class="cover-corner top-left"></div>
    <div class="cover-corner top-right"></div>
    <div class="cover-corner bottom-left"></div>
    <div class="cover-corner bottom-right"></div>
    
    <div class="cover-content">
      <div class="logo-container">
        <div class="logo-placeholder">
          <span class="logo-icon">✝</span>
        </div>
        <div class="institution-name">${INSTITUTION_NAME}</div>
        <div class="institution-subtitle">${INSTITUTION_SUBTITLE}</div>
      </div>
      
      <div class="divider"></div>
      
      <div class="category-badge">${category}</div>
      
      <h1 class="cover-title">${title}</h1>
      
      <div class="cover-meta">
        ${authorName ? `<span>Elaborado por: ${authorName}</span>` : ""}
        <span>${date}</span>
      </div>
    </div>
    
    <div class="cover-footer">
      Material de uso exclusivo para alunos do ${INSTITUTION_NAME}
    </div>
  </div>
  
  <!-- Content Page -->
  <div class="content-page">
    <div class="header-bar">
      <div class="header-accent"></div>
    </div>
    
    <div class="content-header">
      <div class="content-header-left">
        <div class="mini-logo">✝</div>
        <div class="header-text">
          <strong>${INSTITUTION_NAME}</strong><br>
          ${category}
        </div>
      </div>
    </div>
    
    <h1 class="content-title">${title}</h1>
    
    <div class="content-body">
      ${content || `
        <p>Este material foi desenvolvido especialmente para os alunos do ${INSTITUTION_NAME}, com o objetivo de proporcionar uma formação teológica sólida e fundamentada nas Escrituras Sagradas.</p>
        
        <h2>Apresentação</h2>
        <p>O estudo da teologia é fundamental para todo cristão que deseja aprofundar seu conhecimento da Palavra de Deus e estar preparado para servir ao Reino com excelência.</p>
        
        <blockquote>
          "Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade." - 2 Timóteo 2:15
        </blockquote>
        
        <h2>Objetivos do Curso</h2>
        <ul>
          <li>Proporcionar conhecimento teológico fundamentado nas Escrituras</li>
          <li>Desenvolver habilidades de interpretação bíblica</li>
          <li>Preparar líderes para o ministério cristão</li>
          <li>Fortalecer a fé através do estudo sistemático</li>
        </ul>
        
        <h2>Metodologia</h2>
        <p>Nosso método de ensino combina estudo teórico com aplicação prática, sempre tendo a Bíblia como base fundamental para toda reflexão teológica.</p>
      `}
    </div>
  </div>
  
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;
}
