import { Award, GraduationCap, BookOpen, Star, Crown, Sparkles, Shield, Scroll } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type CertificateStyle = "elegant" | "royal" | "minimal" | "executive" | "golden";

interface CertificateTemplateProps {
  style: CertificateStyle;
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  certificateNumber: string;
  durationHours: number;
  className?: string;
}

export function CertificateTemplate({
  style,
  studentName,
  courseName,
  instructorName,
  completionDate,
  certificateNumber,
  durationHours,
  className,
}: CertificateTemplateProps) {
  const formattedDate = format(new Date(completionDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR });

  // ELEGANT - Sofisticado com tons de azul marinho e dourado
  if (style === "elegant") {
    return (
      <div className={cn("relative bg-[#0a1628] text-white p-10 aspect-[1.414/1] overflow-hidden", className)}>
        {/* Padrão de fundo ornamental */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        {/* Bordas douradas */}
        <div className="absolute inset-4 border border-amber-500/30" />
        <div className="absolute inset-6 border border-amber-500/20" />
        
        {/* Ornamentos de canto */}
        <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-amber-500/50" />
        <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-amber-500/50" />
        <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-amber-500/50" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-amber-500/50" />

        {/* Gradiente superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        
        {/* Conteúdo */}
        <div className="relative z-10 h-full flex flex-col justify-between text-center">
          <div className="space-y-3">
            <div className="flex justify-center items-center gap-4">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-amber-500" />
              <Crown className="w-8 h-8 text-amber-500" />
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-amber-500" />
            </div>
            <p className="text-amber-500/80 text-xs tracking-[0.5em] uppercase">Seminário Teológico</p>
            <h1 className="text-4xl font-serif tracking-[0.2em] uppercase bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Certificado
            </h1>
            <p className="text-slate-400 text-sm tracking-widest uppercase">de conclusão</p>
          </div>

          <div className="space-y-6 py-4">
            <p className="text-slate-400 text-sm italic">Conferido a</p>
            <div className="relative">
              <h2 className="text-3xl font-serif font-light text-white tracking-wide">
                {studentName}
              </h2>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            </div>
            <p className="text-slate-400 text-sm pt-4">por concluir com êxito o curso</p>
            <h3 className="text-xl font-serif text-amber-200/90 italic">
              "{courseName}"
            </h3>
            <div className="flex justify-center gap-8 text-sm text-slate-500">
              <span>{durationHours} horas</span>
              <span className="text-amber-500">•</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex justify-between items-end px-8">
            <div className="text-center">
              <div className="w-28 border-t border-amber-500/30 pt-3">
                <p className="text-xs text-slate-300">{instructorName}</p>
                <p className="text-[10px] text-slate-500 mt-1">Instrutor</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-amber-500/30 flex items-center justify-center bg-amber-500/5">
                <Shield className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-[9px] text-slate-500 mt-2 font-mono tracking-wider">{certificateNumber}</p>
            </div>
            <div className="text-center">
              <div className="w-28 border-t border-amber-500/30 pt-3">
                <p className="text-xs text-slate-300">Direção Acadêmica</p>
                <p className="text-[10px] text-slate-500 mt-1">Seminário Teológico</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ROYAL - Luxuoso com roxo profundo e detalhes dourados
  if (style === "royal") {
    return (
      <div className={cn("relative bg-gradient-to-br from-[#1a0a2e] via-[#16082a] to-[#0d0518] text-white p-10 aspect-[1.414/1] overflow-hidden", className)}>
        {/* Efeitos de luz */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[80px]" />
        
        {/* Moldura ornamental */}
        <div className="absolute inset-6 border border-amber-400/20 rounded-sm" />
        <div className="absolute inset-8 border border-purple-400/10 rounded-sm" />
        
        {/* Elementos decorativos dos cantos */}
        <svg className="absolute top-4 left-4 w-24 h-24 text-amber-500/20" viewBox="0 0 100 100">
          <path d="M0 0 L50 0 L50 10 L10 10 L10 50 L0 50 Z" fill="currentColor"/>
          <circle cx="25" cy="25" r="8" stroke="currentColor" strokeWidth="1" fill="none"/>
        </svg>
        <svg className="absolute top-4 right-4 w-24 h-24 text-amber-500/20 rotate-90" viewBox="0 0 100 100">
          <path d="M0 0 L50 0 L50 10 L10 10 L10 50 L0 50 Z" fill="currentColor"/>
          <circle cx="25" cy="25" r="8" stroke="currentColor" strokeWidth="1" fill="none"/>
        </svg>
        <svg className="absolute bottom-4 left-4 w-24 h-24 text-amber-500/20 -rotate-90" viewBox="0 0 100 100">
          <path d="M0 0 L50 0 L50 10 L10 10 L10 50 L0 50 Z" fill="currentColor"/>
          <circle cx="25" cy="25" r="8" stroke="currentColor" strokeWidth="1" fill="none"/>
        </svg>
        <svg className="absolute bottom-4 right-4 w-24 h-24 text-amber-500/20 rotate-180" viewBox="0 0 100 100">
          <path d="M0 0 L50 0 L50 10 L10 10 L10 50 L0 50 Z" fill="currentColor"/>
          <circle cx="25" cy="25" r="8" stroke="currentColor" strokeWidth="1" fill="none"/>
        </svg>

        {/* Conteúdo */}
        <div className="relative z-10 h-full flex flex-col justify-between text-center">
          <div className="space-y-2">
            <div className="flex justify-center items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400/70" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <Sparkles className="w-5 h-5 text-amber-400/70" />
            </div>
            <h1 className="text-3xl font-serif uppercase tracking-[0.3em] bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent font-light">
              Certificado
            </h1>
            <p className="text-purple-300/60 text-xs tracking-[0.4em] uppercase">de excelência</p>
          </div>

          <div className="space-y-5 flex-1 flex flex-col justify-center">
            <p className="text-purple-200/50 text-sm">Concedido com honra a</p>
            <div className="relative py-4">
              <div className="absolute left-1/2 -translate-x-1/2 top-0 w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              <h2 className="text-4xl font-serif font-light tracking-wide bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent py-2">
                {studentName}
              </h2>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            </div>
            <p className="text-purple-200/50 text-sm">pela conclusão exemplar do curso</p>
            <h3 className="text-xl font-serif text-amber-200/80 px-8">
              {courseName}
            </h3>
            <div className="flex justify-center items-center gap-6 text-sm text-purple-300/50">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {durationHours}h
              </span>
              <span className="w-1 h-1 rounded-full bg-amber-500/50" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex justify-between items-end px-6">
            <div className="text-center">
              <div className="w-28 pt-2">
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-400/30 to-transparent mb-2" />
                <p className="text-xs text-purple-100/70">{instructorName}</p>
                <p className="text-[10px] text-purple-300/40 mt-1">Instrutor</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full blur-md opacity-30" />
                <Award className="w-10 h-10 text-amber-400 relative" />
              </div>
              <p className="text-[9px] text-purple-300/40 mt-2 font-mono">{certificateNumber}</p>
            </div>
            <div className="text-center">
              <div className="w-28 pt-2">
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-400/30 to-transparent mb-2" />
                <p className="text-xs text-purple-100/70">Direção</p>
                <p className="text-[10px] text-purple-300/40 mt-1">Seminário Teológico</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MINIMAL - Limpo e moderno com muito espaço em branco
  if (style === "minimal") {
    return (
      <div className={cn("relative bg-white p-12 aspect-[1.414/1] overflow-hidden", className)}>
        {/* Linhas sutis de grade */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
        
        {/* Borda fina */}
        <div className="absolute inset-8 border border-slate-200" />
        
        {/* Acento colorido */}
        <div className="absolute top-8 left-8 right-8 h-1 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900" />

        {/* Conteúdo */}
        <div className="relative z-10 h-full flex flex-col justify-between text-center pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-slate-400 text-[10px] tracking-[0.5em] uppercase">Seminário Teológico</p>
              <h1 className="text-5xl font-light text-slate-900 tracking-tight">
                Certificado
              </h1>
            </div>
          </div>

          <div className="space-y-8 flex-1 flex flex-col justify-center">
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">Este certificado é concedido a</p>
              <h2 className="text-3xl font-medium text-slate-900">
                {studentName}
              </h2>
              <div className="w-16 h-[2px] bg-slate-900 mx-auto" />
            </div>
            <div className="space-y-3">
              <p className="text-slate-500 text-sm">pela conclusão do curso</p>
              <h3 className="text-xl text-slate-700 font-medium">
                {courseName}
              </h3>
            </div>
            <div className="flex justify-center gap-12 text-sm text-slate-400">
              <div className="text-center">
                <p className="text-2xl font-light text-slate-900">{durationHours}</p>
                <p className="text-xs uppercase tracking-wider">horas</p>
              </div>
              <div className="w-[1px] bg-slate-200" />
              <div className="text-center">
                <p className="text-sm text-slate-600">{formattedDate}</p>
                <p className="text-xs uppercase tracking-wider">data</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end px-4">
            <div className="text-left">
              <div className="w-32 border-t border-slate-300 pt-3">
                <p className="text-sm text-slate-700">{instructorName}</p>
                <p className="text-xs text-slate-400">Instrutor</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-300 font-mono tracking-wide">{certificateNumber}</p>
            </div>
            <div className="text-right">
              <div className="w-32 border-t border-slate-300 pt-3">
                <p className="text-sm text-slate-700">Direção</p>
                <p className="text-xs text-slate-400">Seminário Teológico</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EXECUTIVE - Profissional com tons de cinza e verde escuro
  if (style === "executive") {
    return (
      <div className={cn("relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white p-10 aspect-[1.414/1] overflow-hidden", className)}>
        {/* Padrão geométrico sutil */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2l4 3.5-4 3.5z' fill='%2310b981' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Barra lateral verde */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600" />
        
        {/* Bordas */}
        <div className="absolute inset-4 left-6 border border-slate-600/30" />

        {/* Conteúdo */}
        <div className="relative z-10 h-full flex flex-col justify-between pl-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Seminário Teológico</h4>
                  <p className="text-slate-500 text-xs">Formação de Excelência</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-600 text-[10px] font-mono">{certificateNumber}</p>
            </div>
          </div>

          <div className="space-y-6 text-left pl-2">
            <div className="space-y-2">
              <p className="text-emerald-400/70 text-xs uppercase tracking-[0.3em]">Certificado de Conclusão</p>
              <h2 className="text-4xl font-light text-white leading-tight">
                {studentName}
              </h2>
            </div>
            <div className="w-24 h-[3px] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">Completou com sucesso o curso</p>
              <h3 className="text-xl text-white/90 font-medium">
                {courseName}
              </h3>
            </div>
            <div className="flex gap-8 text-sm">
              <div>
                <p className="text-emerald-400 text-xl font-light">{durationHours}h</p>
                <p className="text-slate-500 text-xs">Carga Horária</p>
              </div>
              <div className="w-[1px] bg-slate-700" />
              <div>
                <p className="text-white/80 text-sm">{formattedDate}</p>
                <p className="text-slate-500 text-xs">Data de Conclusão</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end pl-2">
            <div>
              <div className="w-32 border-t border-slate-600 pt-3">
                <p className="text-sm text-slate-300">{instructorName}</p>
                <p className="text-xs text-slate-500">Instrutor</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              ))}
            </div>
            <div>
              <div className="w-32 border-t border-slate-600 pt-3 text-right">
                <p className="text-sm text-slate-300">Direção Acadêmica</p>
                <p className="text-xs text-slate-500">Seminário Teológico</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GOLDEN (default) - Clássico elegante com fundo creme e dourado
  return (
    <div className={cn("relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-10 aspect-[1.414/1] overflow-hidden", className)}>
      {/* Textura de papel */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />
      
      {/* Bordas ornamentais douradas */}
      <div className="absolute inset-3 border-4 border-double border-amber-600/40" />
      <div className="absolute inset-5 border border-amber-500/20" />
      
      {/* Ornamentos de canto elaborados */}
      <div className="absolute top-3 left-3 w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full text-amber-600/40">
          <path d="M0 0 L80 0 L80 10 L10 10 L10 80 L0 80 Z" fill="currentColor"/>
          <path d="M15 15 L60 15 L60 20 L20 20 L20 60 L15 60 Z" fill="currentColor" opacity="0.5"/>
          <circle cx="35" cy="35" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <div className="absolute top-3 right-3 w-20 h-20 rotate-90">
        <svg viewBox="0 0 80 80" className="w-full h-full text-amber-600/40">
          <path d="M0 0 L80 0 L80 10 L10 10 L10 80 L0 80 Z" fill="currentColor"/>
          <path d="M15 15 L60 15 L60 20 L20 20 L20 60 L15 60 Z" fill="currentColor" opacity="0.5"/>
          <circle cx="35" cy="35" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <div className="absolute bottom-3 left-3 w-20 h-20 -rotate-90">
        <svg viewBox="0 0 80 80" className="w-full h-full text-amber-600/40">
          <path d="M0 0 L80 0 L80 10 L10 10 L10 80 L0 80 Z" fill="currentColor"/>
          <path d="M15 15 L60 15 L60 20 L20 20 L20 60 L15 60 Z" fill="currentColor" opacity="0.5"/>
          <circle cx="35" cy="35" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <div className="absolute bottom-3 right-3 w-20 h-20 rotate-180">
        <svg viewBox="0 0 80 80" className="w-full h-full text-amber-600/40">
          <path d="M0 0 L80 0 L80 10 L10 10 L10 80 L0 80 Z" fill="currentColor"/>
          <path d="M15 15 L60 15 L60 20 L20 20 L20 60 L15 60 Z" fill="currentColor" opacity="0.5"/>
          <circle cx="35" cy="35" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>

      {/* Selo central decorativo no topo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg">
            <Scroll className="w-8 h-8 text-amber-100" />
          </div>
          <div className="absolute -inset-2 rounded-full border-2 border-dashed border-amber-500/30 animate-[spin_20s_linear_infinite]" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 h-full flex flex-col justify-between text-center pt-16">
        <div className="space-y-2">
          <p className="text-amber-700/60 text-xs tracking-[0.4em] uppercase font-medium">Seminário Teológico</p>
          <h1 className="text-4xl font-serif font-bold text-amber-900 tracking-wider uppercase">
            Certificado
          </h1>
          <p className="text-amber-600/70 text-sm italic">de Conclusão com Mérito</p>
        </div>

        <div className="space-y-5 flex-1 flex flex-col justify-center py-4">
          <p className="text-amber-800/70 text-sm">Conferimos este certificado a</p>
          <div className="relative inline-block mx-auto">
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-[1px] bg-amber-500" />
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-[1px] bg-amber-500" />
            <h2 className="text-3xl font-serif font-bold text-amber-900 px-12 py-2">
              {studentName}
            </h2>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          </div>
          <p className="text-amber-800/70 text-sm pt-2">por ter concluído com êxito o curso</p>
          <h3 className="text-xl font-serif font-semibold text-amber-800 italic">
            "{courseName}"
          </h3>
          <div className="flex justify-center gap-6 text-sm text-amber-700/70">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              {durationHours} horas
            </span>
            <span className="text-amber-500">✦</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex justify-between items-end px-6">
          <div className="text-center">
            <div className="w-28 border-t-2 border-amber-600/40 pt-3">
              <p className="text-xs text-amber-900">{instructorName}</p>
              <p className="text-[10px] text-amber-600/70 mt-1">Instrutor</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Award className="w-12 h-12 text-amber-600" />
            <p className="text-[9px] text-amber-600/60 mt-1 font-mono tracking-wide">{certificateNumber}</p>
          </div>
          <div className="text-center">
            <div className="w-28 border-t-2 border-amber-600/40 pt-3">
              <p className="text-xs text-amber-900">Direção Acadêmica</p>
              <p className="text-[10px] text-amber-600/70 mt-1">Seminário Teológico</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
