import { useBibleStudies } from "@/hooks/useBibleStudies";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, FileText, Lightbulb, Loader2 } from "lucide-react";

interface BibleStudyPanelProps {
  bookAbbrev: string;
  chapter: number;
}

const studyTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  introduction: { label: "Introdução", icon: <BookOpen className="h-4 w-4" /> },
  commentary: { label: "Comentário", icon: <FileText className="h-4 w-4" /> },
  application: { label: "Aplicação", icon: <Lightbulb className="h-4 w-4" /> },
};

export function BibleStudyPanel({ bookAbbrev, chapter }: BibleStudyPanelProps) {
  const { data: studies, isLoading } = useBibleStudies(bookAbbrev, chapter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!studies || studies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum estudo disponível para este livro.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <Accordion type="single" collapsible className="w-full" defaultValue={studies[0]?.id}>
        {studies.map((study) => {
          const typeInfo = studyTypeLabels[study.study_type] || { 
            label: study.study_type, 
            icon: <FileText className="h-4 w-4" /> 
          };
          
          return (
            <AccordionItem key={study.id} value={study.id}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  {typeInfo.icon}
                  <span className="font-medium">{study.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {study.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-3 text-sm leading-relaxed whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </ScrollArea>
  );
}
