import { Award, GraduationCap, BookOpen, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type CertificateStyle = "classic" | "modern" | "premium";

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

  if (style === "classic") {
    return (
      <div className={cn("relative bg-amber-50 border-8 border-double border-amber-700 p-8 aspect-[1.4/1]", className)}>
        {/* Corner ornaments */}
        <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-amber-600 opacity-60" />
        <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-amber-600 opacity-60" />
        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-amber-600 opacity-60" />
        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-amber-600 opacity-60" />

        {/* Content */}
        <div className="text-center space-y-4 h-full flex flex-col justify-between py-4">
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-amber-50" />
              </div>
            </div>
            <h1 className="text-3xl font-serif font-bold text-amber-900 tracking-wider uppercase">
              Certificado de Conclusão
            </h1>
            <p className="text-amber-700 text-sm">Seminário Teológico Online</p>
          </div>

          <div className="space-y-3">
            <p className="text-amber-800">Certificamos que</p>
            <h2 className="text-2xl font-serif font-bold text-amber-900 border-b-2 border-amber-300 pb-2 mx-auto inline-block px-8">
              {studentName}
            </h2>
            <p className="text-amber-800">concluiu com êxito o curso</p>
            <h3 className="text-xl font-serif font-semibold text-amber-900">
              "{courseName}"
            </h3>
            <p className="text-amber-700 text-sm">
              Carga horária: {durationHours} horas | Data: {formattedDate}
            </p>
          </div>

          <div className="flex justify-between items-end px-8">
            <div className="text-center">
              <div className="w-32 border-t-2 border-amber-600 pt-2">
                <p className="text-xs text-amber-800">{instructorName}</p>
                <p className="text-xs text-amber-600">Instrutor</p>
              </div>
            </div>
            <div className="text-center">
              <Award className="w-12 h-12 text-amber-600 mx-auto" />
              <p className="text-[10px] text-amber-600 mt-1 font-mono">{certificateNumber}</p>
            </div>
            <div className="text-center">
              <div className="w-32 border-t-2 border-amber-600 pt-2">
                <p className="text-xs text-amber-800">Direção Acadêmica</p>
                <p className="text-xs text-amber-600">Seminário Teológico</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (style === "modern") {
    return (
      <div className={cn("relative bg-slate-900 text-white p-8 aspect-[1.4/1] overflow-hidden", className)}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-cyan-500 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-500 via-cyan-400 to-blue-600" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between pl-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-blue-400 text-xs uppercase tracking-widest">Seminário Teológico</p>
                  <p className="text-slate-400 text-[10px]">Educação Online</p>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-[10px] font-mono">{certificateNumber}</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-blue-400 text-xs uppercase tracking-widest mb-1">Certificado de Conclusão</p>
              <h2 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  {studentName}
                </span>
              </h2>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-sm">completou com sucesso</p>
              <h3 className="text-xl font-semibold text-white">{courseName}</h3>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-slate-500 text-xs">Instrutor: {instructorName}</p>
              <p className="text-slate-500 text-xs">Carga horária: {durationHours}h</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                ))}
              </div>
              <p className="text-slate-400 text-xs">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Premium style
  return (
    <div className={cn("relative bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8 aspect-[1.4/1] overflow-hidden", className)}>
      {/* Gold border effect */}
      <div className="absolute inset-0 p-1">
        <div className="absolute inset-0 border-4 border-amber-400/30" />
        <div className="absolute inset-2 border border-amber-400/20" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-6 left-6 w-20 h-20 opacity-10">
        <svg viewBox="0 0 100 100" className="text-amber-600 fill-current">
          <path d="M50 0 L100 50 L50 100 L0 50 Z" />
        </svg>
      </div>
      <div className="absolute bottom-6 right-6 w-20 h-20 opacity-10">
        <svg viewBox="0 0 100 100" className="text-amber-600 fill-current">
          <path d="M50 0 L100 50 L50 100 L0 50 Z" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center h-full flex flex-col justify-between py-2">
        <div className="space-y-2">
          <div className="flex justify-center items-center gap-2">
            <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-amber-500" />
            <Award className="w-10 h-10 text-amber-500" />
            <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-amber-500" />
          </div>
          <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 bg-clip-text text-transparent uppercase tracking-[0.3em]">
            Certificado
          </h1>
          <p className="text-slate-500 text-xs tracking-widest uppercase">de excelência acadêmica</p>
        </div>

        <div className="space-y-4">
          <p className="text-slate-600 text-sm italic">Este documento certifica que</p>
          <div className="relative inline-block">
            <h2 className="text-2xl font-serif font-bold text-slate-800 px-12">
              {studentName}
            </h2>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          </div>
          <p className="text-slate-600 text-sm">concluiu com distinção o curso de</p>
          <h3 className="text-lg font-serif font-semibold text-slate-700 italic">
            {courseName}
          </h3>
          <div className="flex justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              {durationHours} horas
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              {formattedDate}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center px-4">
          <div className="text-center flex-1">
            <div className="w-24 mx-auto border-t border-slate-300 pt-2">
              <p className="text-[10px] text-slate-700">{instructorName}</p>
              <p className="text-[8px] text-slate-500">Instrutor</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border-2 border-amber-400 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-amber-500" />
            </div>
            <p className="text-[8px] text-slate-400 mt-1 font-mono">{certificateNumber}</p>
          </div>
          <div className="text-center flex-1">
            <div className="w-24 mx-auto border-t border-slate-300 pt-2">
              <p className="text-[10px] text-slate-700">Direção</p>
              <p className="text-[8px] text-slate-500">Seminário Teológico</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
