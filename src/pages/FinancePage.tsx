import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useMyTransactions } from "@/hooks/useFinancial";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FinancePage() {
  const { data: transactions = [], isLoading } = useMyTransactions();

  const pending = transactions.filter(t => t.status === "pending");
  const paid = transactions.filter(t => t.status === "paid");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-500">Pago</Badge>;
      case "pending": return <Badge variant="secondary">Pendente</Badge>;
      case "overdue": return <Badge variant="destructive">Vencido</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <AppLayout><div className="p-6"><Skeleton className="h-96" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          Meu Financeiro
        </h1>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Pendentes</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pending.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Pagos</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paid.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Total Pago</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {paid.reduce((s, t) => s + Number(t.amount), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">Nenhuma cobrança pendente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{t.description || "Mensalidade"}</p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {t.due_date ? format(new Date(t.due_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      {getStatusBadge(t.status)}
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
