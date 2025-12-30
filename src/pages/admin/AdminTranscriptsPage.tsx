import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, BookOpen, Award, Clock } from "lucide-react";
import { useAllAcademicRecords } from "@/hooks/useAcademicRecords";
import { useCourses } from "@/hooks/useCourses";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminTranscriptsPage() {
  const { data: records = [], isLoading: loadingRecords } = useAllAcademicRecords();
  const { data: courses = [], isLoading: loadingCourses } = useCourses();

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || "Curso não encontrado";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Concluído</Badge>;
      case "in_progress":
        return <Badge variant="secondary">Em Andamento</Badge>;
      case "failed":
        return <Badge variant="destructive">Reprovado</Badge>;
      case "withdrawn":
        return <Badge variant="outline">Desistente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const statusCount = {
    in_progress: records.filter(r => r.status === "in_progress").length,
    completed: records.filter(r => r.status === "completed").length,
    failed: records.filter(r => r.status === "failed").length,
  };

  if (loadingRecords || loadingCourses) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Histórico Acadêmico
          </h1>
          <p className="text-muted-foreground">Gerencie os registros acadêmicos dos alunos</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCount.in_progress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <Award className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statusCount.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reprovados</CardTitle>
              <BookOpen className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statusCount.failed}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            {records.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum registro acadêmico</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Conclusão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {getCourseName(record.course_id)}
                      </TableCell>
                      <TableCell>
                        {record.grade !== null ? (
                          <span className={record.grade >= 7 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                            {record.grade.toFixed(1)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {format(new Date(record.started_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {record.completed_at
                          ? format(new Date(record.completed_at), "dd/MM/yyyy", { locale: ptBR })
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
