import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Award, Clock, BookOpen } from "lucide-react";
import { useMyAcademicRecords } from "@/hooks/useAcademicRecords";
import { useCourses } from "@/hooks/useCourses";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TranscriptPage() {
  const { data: records = [], isLoading: loadingRecords } = useMyAcademicRecords();
  const { data: courses = [] } = useCourses();

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || "Curso";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500">Concluído</Badge>;
      case "in_progress": return <Badge variant="secondary">Em Andamento</Badge>;
      case "failed": return <Badge variant="destructive">Reprovado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const completed = records.filter(r => r.status === "completed");
  const inProgress = records.filter(r => r.status === "in_progress");

  if (loadingRecords) {
    return <AppLayout><div className="p-6"><Skeleton className="h-96" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          Meu Histórico Acadêmico
        </h1>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Em Andamento</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                {inProgress.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Concluídos</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <Award className="h-5 w-5" />
                {completed.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Média Geral</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completed.length > 0
                  ? (completed.reduce((s, r) => s + (r.grade || 0), 0) / completed.length).toFixed(1)
                  : "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum registro acadêmico ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map(record => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{getCourseName(record.course_id)}</p>
                      <p className="text-sm text-muted-foreground">
                        Início: {format(new Date(record.started_at), "dd/MM/yyyy", { locale: ptBR })}
                        {record.completed_at && ` • Conclusão: ${format(new Date(record.completed_at), "dd/MM/yyyy", { locale: ptBR })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {record.grade !== null && (
                        <span className={`text-xl font-bold ${record.grade >= 7 ? "text-green-600" : "text-red-600"}`}>
                          {record.grade.toFixed(1)}
                        </span>
                      )}
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
