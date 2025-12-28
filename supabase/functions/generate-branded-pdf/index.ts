import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cores do sistema (burgundy/wine com dourado)
const COLORS = {
  primary: "#6b2c3d",
  primaryDark: "#4a1f2b",
  accent: "#c9a227",
  text: "#1a1a1a",
  textLight: "#4a4a4a",
  lightBg: "#f9f7f4",
  cream: "#fdfbf7",
  border: "#e8e4de",
};

const INSTITUTION_NAME = "P.O.D Seminário Teológico";
const INSTITUTION_SUBTITLE = "Formando Líderes para o Reino de Deus";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, category, content } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Título é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = generateBrandedPdfHtml({
      title,
      category: category || "Material Didático",
      content: content || "",
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
  date: string;
}

function generateBrandedPdfHtml(options: PdfOptions): string {
  const { title, category, content, date } = options;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${INSTITUTION_NAME}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Source+Sans+3:wght@400;500;600;700&display=swap');
    
    :root {
      --primary: ${COLORS.primary};
      --primary-dark: ${COLORS.primaryDark};
      --accent: ${COLORS.accent};
      --text: ${COLORS.text};
      --text-light: ${COLORS.textLight};
      --light-bg: ${COLORS.lightBg};
      --cream: ${COLORS.cream};
      --border: ${COLORS.border};
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 20mm 18mm 25mm 22mm;
    }
    
    @page :first {
      margin: 0;
    }
    
    body {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 12pt;
      line-height: 1.7;
      color: var(--text);
      background: white;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }
    
    /* ========== CAPA ========== */
    .cover-page {
      width: 210mm;
      height: 297mm;
      background: linear-gradient(160deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 50%, ${COLORS.primaryDark} 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      position: relative;
      page-break-after: always;
      overflow: hidden;
      padding: 0;
    }
    
    .cover-ornament-top,
    .cover-ornament-bottom {
      width: 100%;
      height: 60px;
      background: linear-gradient(90deg, transparent 0%, ${COLORS.accent}30 20%, ${COLORS.accent}50 50%, ${COLORS.accent}30 80%, transparent 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .cover-ornament-line {
      width: 70%;
      height: 1px;
      background: linear-gradient(90deg, transparent, ${COLORS.accent}, transparent);
    }
    
    .cover-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }
    
    .cover-logo-area {
      margin-bottom: 50px;
    }
    
    .cover-logo-symbol {
      width: 100px;
      height: 100px;
      border: 3px solid ${COLORS.accent};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 25px;
      background: rgba(255,255,255,0.05);
    }
    
    .cover-logo-symbol span {
      font-size: 42px;
      color: ${COLORS.accent};
    }
    
    .cover-institution {
      font-family: 'Source Sans 3', sans-serif;
      font-size: 13pt;
      font-weight: 600;
      color: ${COLORS.accent};
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-bottom: 8px;
    }
    
    .cover-slogan {
      font-family: 'Crimson Pro', serif;
      font-size: 11pt;
      color: rgba(255,255,255,0.7);
      font-style: italic;
    }
    
    .cover-divider {
      width: 120px;
      height: 2px;
      background: ${COLORS.accent};
      margin: 40px auto;
      position: relative;
    }
    
    .cover-divider::before,
    .cover-divider::after {
      content: '◆';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: ${COLORS.accent};
      font-size: 8px;
    }
    
    .cover-divider::before { left: -15px; }
    .cover-divider::after { right: -15px; }
    
    .cover-category {
      font-family: 'Source Sans 3', sans-serif;
      font-size: 10pt;
      font-weight: 500;
      color: rgba(255,255,255,0.6);
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 20px;
    }
    
    .cover-title {
      font-family: 'Crimson Pro', serif;
      font-size: 36pt;
      font-weight: 700;
      color: white;
      line-height: 1.2;
      max-width: 500px;
      margin-bottom: 30px;
    }
    
    .cover-subtitle {
      font-family: 'Source Sans 3', sans-serif;
      font-size: 11pt;
      color: rgba(255,255,255,0.5);
      margin-top: 40px;
    }
    
    .cover-footer {
      padding: 30px;
      text-align: center;
    }
    
    .cover-footer-text {
      font-family: 'Source Sans 3', sans-serif;
      font-size: 9pt;
      color: rgba(255,255,255,0.4);
      letter-spacing: 1px;
    }
    
    /* ========== PÁGINAS DE CONTEÚDO ========== */
    .content-wrapper {
      counter-reset: page-counter;
    }
    
    .content-page {
      background: white;
      position: relative;
      counter-increment: page-counter;
    }
    
    /* Cabeçalho de página */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 30px;
      border-bottom: 1px solid var(--border);
    }
    
    .page-header-left {
      font-family: 'Source Sans 3', sans-serif;
      font-size: 9pt;
      color: var(--primary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .page-header-right {
      font-family: 'Crimson Pro', serif;
      font-size: 10pt;
      color: var(--text-light);
      font-style: italic;
    }
    
    /* Título do documento */
    .document-title {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 2px solid var(--accent);
    }
    
    .document-title h1 {
      font-family: 'Crimson Pro', serif;
      font-size: 28pt;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 10px;
      line-height: 1.2;
    }
    
    .document-title .category-tag {
      font-family: 'Source Sans 3', sans-serif;
      font-size: 10pt;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 600;
    }
    
    /* Corpo do texto */
    .content-body {
      columns: 1;
      column-gap: 30px;
      text-align: justify;
      hyphens: auto;
    }
    
    .content-body p {
      margin-bottom: 16px;
      text-indent: 2em;
      orphans: 3;
      widows: 3;
    }
    
    .content-body p:first-of-type {
      text-indent: 0;
    }
    
    .content-body p:first-of-type::first-letter {
      font-size: 3.5em;
      float: left;
      line-height: 0.8;
      padding-right: 10px;
      padding-top: 5px;
      color: var(--primary);
      font-weight: 700;
    }
    
    /* Títulos */
    .content-body h1 {
      font-family: 'Crimson Pro', serif;
      font-size: 22pt;
      font-weight: 700;
      color: var(--primary);
      margin: 35px 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
      page-break-after: avoid;
      column-span: all;
    }
    
    .content-body h2 {
      font-family: 'Crimson Pro', serif;
      font-size: 17pt;
      font-weight: 600;
      color: var(--primary);
      margin: 30px 0 15px 0;
      page-break-after: avoid;
      position: relative;
      padding-left: 15px;
    }
    
    .content-body h2::before {
      content: '';
      position: absolute;
      left: 0;
      top: 5px;
      bottom: 5px;
      width: 4px;
      background: var(--accent);
    }
    
    .content-body h3 {
      font-family: 'Crimson Pro', serif;
      font-size: 14pt;
      font-weight: 600;
      color: var(--primary-dark);
      margin: 25px 0 12px 0;
      page-break-after: avoid;
    }
    
    .content-body h4 {
      font-family: 'Source Sans 3', sans-serif;
      font-size: 12pt;
      font-weight: 600;
      color: var(--text);
      margin: 20px 0 10px 0;
      page-break-after: avoid;
    }
    
    /* Listas */
    .content-body ul, .content-body ol {
      margin: 20px 0 20px 25px;
      padding: 0;
    }
    
    .content-body li {
      margin-bottom: 10px;
      padding-left: 8px;
      text-indent: 0;
    }
    
    .content-body ul li {
      list-style-type: none;
      position: relative;
    }
    
    .content-body ul li::before {
      content: '▸';
      color: var(--accent);
      position: absolute;
      left: -18px;
      font-size: 10pt;
    }
    
    .content-body ol {
      counter-reset: list-counter;
    }
    
    .content-body ol li {
      list-style: none;
      counter-increment: list-counter;
    }
    
    .content-body ol li::before {
      content: counter(list-counter) ".";
      color: var(--primary);
      font-weight: 600;
      position: absolute;
      left: -25px;
    }
    
    /* Citações / Versículos */
    .content-body blockquote {
      margin: 25px 0;
      padding: 20px 25px;
      background: linear-gradient(135deg, var(--cream) 0%, var(--light-bg) 100%);
      border-left: 4px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-style: italic;
      color: var(--text-light);
      position: relative;
      page-break-inside: avoid;
    }
    
    .content-body blockquote::before {
      content: '"';
      font-family: 'Crimson Pro', serif;
      font-size: 48pt;
      color: var(--accent);
      opacity: 0.3;
      position: absolute;
      top: 5px;
      left: 10px;
      line-height: 1;
    }
    
    .content-body blockquote p {
      text-indent: 0;
      margin-bottom: 0;
      padding-left: 25px;
    }
    
    /* Destaques */
    .content-body strong {
      color: var(--primary);
      font-weight: 600;
    }
    
    .content-body em {
      font-style: italic;
      color: var(--text-light);
    }
    
    /* Caixa de destaque */
    .highlight-box {
      background: var(--light-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      page-break-inside: avoid;
    }
    
    .highlight-box h4 {
      margin-top: 0;
      color: var(--primary);
    }
    
    /* Rodapé de página */
    .page-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 20mm;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Source Sans 3', sans-serif;
      font-size: 9pt;
      color: var(--text-light);
      border-top: 1px solid var(--border);
      background: white;
      padding: 0 22mm;
    }
    
    .page-footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    
    .page-footer-left {
      color: var(--primary);
      font-weight: 500;
    }
    
    .page-footer-center {
      color: var(--text-light);
    }
    
    .page-footer-right {
      font-weight: 600;
      color: var(--primary);
    }
    
    /* ========== IMPRESSÃO ========== */
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .cover-page {
        page-break-after: always;
      }
      
      .content-page {
        page-break-before: always;
      }
      
      h1, h2, h3, h4 {
        page-break-after: avoid;
      }
      
      blockquote, .highlight-box {
        page-break-inside: avoid;
      }
      
      p {
        orphans: 3;
        widows: 3;
      }
    }
    
    /* Responsivo para preview na tela */
    @media screen {
      .cover-page,
      .content-page {
        max-width: 210mm;
        margin: 20px auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      }
      
      .content-page {
        padding: 25mm 22mm;
        min-height: 297mm;
      }
    }
  </style>
</head>
<body>
  <!-- Capa -->
  <div class="cover-page">
    <div class="cover-ornament-top">
      <div class="cover-ornament-line"></div>
    </div>
    
    <div class="cover-main">
      <div class="cover-logo-area">
        <div class="cover-logo-symbol">
          <span>✝</span>
        </div>
        <div class="cover-institution">${INSTITUTION_NAME}</div>
        <div class="cover-slogan">${INSTITUTION_SUBTITLE}</div>
      </div>
      
      <div class="cover-divider"></div>
      
      <div class="cover-category">${category}</div>
      <h1 class="cover-title">${title}</h1>
      <div class="cover-subtitle">Curso Superior de Teologia • Bacharelado</div>
    </div>
    
    <div class="cover-footer">
      <div class="cover-footer-text">${date} • Material Didático Exclusivo</div>
    </div>
    
    <div class="cover-ornament-bottom">
      <div class="cover-ornament-line"></div>
    </div>
  </div>
  
  <!-- Conteúdo -->
  <div class="content-wrapper">
    <div class="content-page">
      <div class="page-header">
        <div class="page-header-left">${INSTITUTION_NAME}</div>
        <div class="page-header-right">${title}</div>
      </div>
      
      <div class="document-title">
        <div class="category-tag">${category}</div>
        <h1>${title}</h1>
      </div>
      
      <div class="content-body">
        ${content || generateDefaultContent(title)}
      </div>
    </div>
  </div>
  
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 800);
    };
  </script>
</body>
</html>`;
}

function generateDefaultContent(title: string): string {
  return `
    <p>Este material foi desenvolvido especialmente para os alunos do ${INSTITUTION_NAME}, com o objetivo de proporcionar uma formação teológica sólida e fundamentada nas Escrituras Sagradas.</p>
    
    <h2>Apresentação</h2>
    <p>O estudo de ${title} é fundamental para todo cristão que deseja aprofundar seu conhecimento da Palavra de Deus e estar preparado para servir ao Reino com excelência. Este curso foi elaborado com rigor acadêmico e fidelidade às Escrituras.</p>
    
    <blockquote>
      "Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade." — 2 Timóteo 2:15
    </blockquote>
    
    <h2>Objetivos do Curso</h2>
    <ul>
      <li>Proporcionar conhecimento teológico fundamentado nas Escrituras Sagradas</li>
      <li>Desenvolver habilidades de interpretação e aplicação bíblica</li>
      <li>Preparar líderes capacitados para o ministério cristão</li>
      <li>Fortalecer a fé através do estudo sistemático da Palavra</li>
    </ul>
    
    <h2>Metodologia de Ensino</h2>
    <p>Nosso método de ensino combina estudo teórico com aplicação prática, sempre tendo a Bíblia como base fundamental para toda reflexão teológica. Os alunos são incentivados a desenvolver um pensamento crítico e uma vida devocional consistente.</p>
  `;
}
