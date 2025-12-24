import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { certificateId, style = 'premium' } = await req.json();

    if (!certificateId) {
      return new Response(
        JSON.stringify({ error: 'Certificate ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch certificate data with course info
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .select(`
        *,
        courses (
          title,
          instructor,
          duration_hours
        )
      `)
      .eq('id', certificateId)
      .single();

    if (certError || !certificate) {
      console.error('Certificate fetch error:', certError);
      return new Response(
        JSON.stringify({ error: 'Certificate not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch profile for student name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', certificate.user_id)
      .single();

    const studentName = profile?.full_name || 'Estudante';
    const courseName = certificate.courses?.title || 'Curso Concluído';
    const instructorName = certificate.courses?.instructor || 'Instrutor';
    const durationHours = certificate.courses?.duration_hours || 0;
    const certificateNumber = certificate.certificate_number;
    const issuedAt = new Date(certificate.issued_at);

    // Format date in Portuguese
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const formattedDate = `${issuedAt.getDate()} de ${months[issuedAt.getMonth()]} de ${issuedAt.getFullYear()}`;

    // Generate HTML based on style
    let htmlContent = '';
    
    if (style === 'classic') {
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Lato', sans-serif; }
            .certificate {
              width: 842px;
              height: 595px;
              background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
              border: 16px double #b45309;
              padding: 40px;
              position: relative;
            }
            .corner { position: absolute; width: 60px; height: 60px; border-color: #d97706; }
            .corner-tl { top: 20px; left: 20px; border-left: 4px solid; border-top: 4px solid; }
            .corner-tr { top: 20px; right: 20px; border-right: 4px solid; border-top: 4px solid; }
            .corner-bl { bottom: 20px; left: 20px; border-left: 4px solid; border-bottom: 4px solid; }
            .corner-br { bottom: 20px; right: 20px; border-right: 4px solid; border-bottom: 4px solid; }
            .content { text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
            .header h1 { font-family: 'Playfair Display', serif; font-size: 32px; color: #78350f; text-transform: uppercase; letter-spacing: 4px; }
            .header p { color: #92400e; font-size: 14px; margin-top: 8px; }
            .icon { width: 60px; height: 60px; background: #d97706; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; }
            .icon svg { width: 32px; height: 32px; color: #fffbeb; }
            .body p { color: #92400e; font-size: 16px; }
            .student-name { font-family: 'Playfair Display', serif; font-size: 28px; color: #78350f; border-bottom: 2px solid #fcd34d; padding-bottom: 8px; display: inline-block; margin: 16px 0; }
            .course-name { font-family: 'Playfair Display', serif; font-size: 22px; color: #78350f; font-style: italic; }
            .details { color: #a16207; font-size: 13px; margin-top: 16px; }
            .footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 40px; }
            .signature { text-align: center; width: 150px; }
            .signature-line { border-top: 2px solid #d97706; padding-top: 8px; }
            .signature-name { font-size: 11px; color: #92400e; }
            .signature-title { font-size: 10px; color: #a16207; }
            .seal { text-align: center; }
            .seal-icon { color: #d97706; }
            .cert-number { font-size: 9px; color: #a16207; font-family: monospace; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            <div class="content">
              <div class="header">
                <div class="icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <h1>Certificado de Conclusão</h1>
                <p>Seminário Teológico Online</p>
              </div>
              <div class="body">
                <p>Certificamos que</p>
                <div class="student-name">${studentName}</div>
                <p>concluiu com êxito o curso</p>
                <div class="course-name">"${courseName}"</div>
                <p class="details">Carga horária: ${durationHours} horas | Data: ${formattedDate}</p>
              </div>
              <div class="footer">
                <div class="signature">
                  <div class="signature-line">
                    <p class="signature-name">${instructorName}</p>
                    <p class="signature-title">Instrutor</p>
                  </div>
                </div>
                <div class="seal">
                  <svg class="seal-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                  </svg>
                  <p class="cert-number">${certificateNumber}</p>
                </div>
                <div class="signature">
                  <div class="signature-line">
                    <p class="signature-name">Direção Acadêmica</p>
                    <p class="signature-title">Seminário Teológico</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (style === 'modern') {
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; }
            .certificate {
              width: 842px;
              height: 595px;
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              color: white;
              padding: 40px;
              position: relative;
              overflow: hidden;
            }
            .bg-glow { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.1; }
            .bg-glow-1 { top: -100px; right: -100px; width: 400px; height: 400px; background: #3b82f6; }
            .bg-glow-2 { bottom: -50px; left: -50px; width: 300px; height: 300px; background: #06b6d4; }
            .accent-line { position: absolute; left: 0; top: 0; bottom: 0; width: 8px; background: linear-gradient(to bottom, #3b82f6, #06b6d4, #3b82f6); }
            .content { position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding-left: 24px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; }
            .logo { display: flex; align-items: center; gap: 12px; }
            .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
            .logo-text { }
            .logo-title { color: #60a5fa; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; }
            .logo-subtitle { color: #64748b; font-size: 10px; }
            .cert-number { color: #475569; font-size: 10px; font-family: monospace; }
            .body { }
            .label { color: #60a5fa; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px; }
            .student-name { font-size: 36px; font-weight: 700; background: linear-gradient(90deg, #60a5fa, #22d3ee, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .completed-text { color: #94a3b8; font-size: 14px; margin-top: 24px; }
            .course-name { font-size: 22px; font-weight: 600; color: white; margin-top: 8px; }
            .footer { display: flex; justify-content: space-between; align-items: flex-end; }
            .footer-left { }
            .footer-text { color: #475569; font-size: 12px; }
            .footer-right { text-align: right; }
            .stars { display: flex; gap: 4px; justify-content: flex-end; margin-bottom: 4px; }
            .star { width: 12px; height: 12px; fill: #22d3ee; }
            .date { color: #94a3b8; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="bg-glow bg-glow-1"></div>
            <div class="bg-glow bg-glow-2"></div>
            <div class="accent-line"></div>
            <div class="content">
              <div class="header">
                <div class="logo">
                  <div class="logo-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                    </svg>
                  </div>
                  <div class="logo-text">
                    <p class="logo-title">Seminário Teológico</p>
                    <p class="logo-subtitle">Educação Online</p>
                  </div>
                </div>
                <p class="cert-number">${certificateNumber}</p>
              </div>
              <div class="body">
                <p class="label">Certificado de Conclusão</p>
                <h2 class="student-name">${studentName}</h2>
                <p class="completed-text">completou com sucesso</p>
                <h3 class="course-name">${courseName}</h3>
              </div>
              <div class="footer">
                <div class="footer-left">
                  <p class="footer-text">Instrutor: ${instructorName}</p>
                  <p class="footer-text">Carga horária: ${durationHours}h</p>
                </div>
                <div class="footer-right">
                  <div class="stars">
                    ${[1,2,3,4,5].map(() => '<svg class="star" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#22d3ee"/></svg>').join('')}
                  </div>
                  <p class="date">${formattedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // Premium style
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@400&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Lato', sans-serif; }
            .certificate {
              width: 842px;
              height: 595px;
              background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%);
              padding: 40px;
              position: relative;
              overflow: hidden;
            }
            .border-outer { position: absolute; inset: 8px; border: 4px solid rgba(251, 191, 36, 0.3); }
            .border-inner { position: absolute; inset: 16px; border: 1px solid rgba(251, 191, 36, 0.2); }
            .diamond { position: absolute; width: 80px; height: 80px; opacity: 0.1; }
            .diamond-tl { top: 24px; left: 24px; }
            .diamond-br { bottom: 24px; right: 24px; }
            .diamond svg { width: 100%; height: 100%; fill: #d97706; }
            .content { position: relative; z-index: 10; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 16px 0; }
            .header { }
            .header-icon { display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 8px; }
            .header-line { width: 32px; height: 2px; background: linear-gradient(90deg, transparent, #f59e0b); }
            .header-line-r { background: linear-gradient(90deg, #f59e0b, transparent); }
            .header h1 { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; background: linear-gradient(90deg, #b45309, #f59e0b, #b45309); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-transform: uppercase; letter-spacing: 8px; }
            .header p { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 4px; margin-top: 4px; }
            .body { }
            .body-intro { color: #475569; font-size: 14px; font-style: italic; }
            .student-name { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #1e293b; margin: 16px 0; position: relative; display: inline-block; padding: 0 48px; }
            .student-name::after { content: ''; position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 75%; height: 1px; background: linear-gradient(90deg, transparent, #fbbf24, transparent); }
            .course-intro { color: #475569; font-size: 14px; margin-top: 24px; }
            .course-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; color: #334155; font-style: italic; margin-top: 8px; }
            .details { display: flex; justify-content: center; gap: 24px; margin-top: 16px; color: #64748b; font-size: 12px; }
            .detail-item { display: flex; align-items: center; gap: 4px; }
            .detail-dot { width: 4px; height: 4px; background: #fbbf24; border-radius: 50%; }
            .footer { display: flex; justify-content: space-between; align-items: center; padding: 0 16px; }
            .signature { text-align: center; flex: 1; }
            .signature-line { width: 100px; margin: 0 auto; border-top: 1px solid #cbd5e1; padding-top: 8px; }
            .signature-name { font-size: 10px; color: #334155; }
            .signature-title { font-size: 8px; color: #64748b; }
            .seal { display: flex; flex-direction: column; align-items: center; }
            .seal-circle { width: 56px; height: 56px; border: 2px solid #fbbf24; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            .seal-icon { color: #f59e0b; }
            .seal-number { font-size: 8px; color: #94a3b8; font-family: monospace; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="border-outer"></div>
            <div class="border-inner"></div>
            <div class="diamond diamond-tl"><svg viewBox="0 0 100 100"><path d="M50 0 L100 50 L50 100 L0 50 Z"/></svg></div>
            <div class="diamond diamond-br"><svg viewBox="0 0 100 100"><path d="M50 0 L100 50 L50 100 L0 50 Z"/></svg></div>
            <div class="content">
              <div class="header">
                <div class="header-icon">
                  <div class="header-line"></div>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                  </svg>
                  <div class="header-line header-line-r"></div>
                </div>
                <h1>Certificado</h1>
                <p>de excelência acadêmica</p>
              </div>
              <div class="body">
                <p class="body-intro">Este documento certifica que</p>
                <h2 class="student-name">${studentName}</h2>
                <p class="course-intro">concluiu com distinção o curso de</p>
                <h3 class="course-name">${courseName}</h3>
                <div class="details">
                  <span class="detail-item"><span class="detail-dot"></span>${durationHours} horas</span>
                  <span class="detail-item"><span class="detail-dot"></span>${formattedDate}</span>
                </div>
              </div>
              <div class="footer">
                <div class="signature">
                  <div class="signature-line">
                    <p class="signature-name">${instructorName}</p>
                    <p class="signature-title">Instrutor</p>
                  </div>
                </div>
                <div class="seal">
                  <div class="seal-circle">
                    <svg class="seal-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                  </div>
                  <p class="seal-number">${certificateNumber}</p>
                </div>
                <div class="signature">
                  <div class="signature-line">
                    <p class="signature-name">Direção</p>
                    <p class="signature-title">Seminário Teológico</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Return HTML content for client-side PDF generation
    console.log('Certificate HTML generated successfully for:', certificateId);
    
    return new Response(
      JSON.stringify({ 
        html: htmlContent,
        studentName,
        courseName,
        certificateNumber 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating certificate:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate certificate' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
