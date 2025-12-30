import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Clock, CheckCircle, Plus, Heart } from "lucide-react";
import { useAllTransactions, useDonations, useCreateTransaction, useUpdateTransaction, FinancialTransaction } from "@/hooks/useFinancial";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function AdminFinancePage() {
  const { data: transactions = [], isLoading: loadingTransactions } = useAllTransactions();
  const { data: donations = [], isLoading: loadingDonations } = useDonations();
  const updateTransaction = useUpdateTransaction();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const pendingTransactions = transactions.filter(t => t.status === "pending");
  const paidTransactions = transactions.filter(t => t.status === "paid");
  const overdueTransactions = transactions.filter(t => t.status === "overdue");

  const totalReceived = paidTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPending = pendingTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  const handleMarkAsPaid = async (transaction: FinancialTransaction) => {
    try {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        status: "paid",
        paid_at: new Date().toISOString(),
      });
      toast.success("Pagamento confirmado!");
    } catch (error) {
      toast.error("Erro ao confirmar pagamento");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Pago</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "overdue":
        return <Badge variant="destructive">Vencido</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "tuition":
        return <Badge variant="outline">Mensalidade</Badge>;
      case "donation":
        return <Badge variant="outline" className="border-pink-500 text-pink-500">Doação</Badge>;
      case "material":
        return <Badge variant="outline">Material</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loadingTransactions || loadingDonations) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              Financeiro
            </h1>
            <p className="text-muted-foreground">Gerencie mensalidades, pagamentos e doações</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nova Cobrança</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Cobrança</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Funcionalidade de criação de cobranças será implementada com integração de pagamento.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalReceived.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">{paidTransactions.length} pagamentos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">A Receber</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">{pendingTransactions.length} pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueTransactions.length}</div>
              <p className="text-xs text-muted-foreground">cobranças em atraso</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Doações</CardTitle>
              <Heart className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                R$ {totalDonations.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">{donations.length} doações</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions">
          <TabsList>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="donations">Doações</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardContent className="pt-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Nenhuma transação registrada</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.description || "Sem descrição"}</TableCell>
                          <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                          <TableCell className="font-medium">
                            R$ {Number(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            {transaction.due_date
                              ? format(new Date(transaction.due_date), "dd/MM/yyyy", { locale: ptBR })
                              : "-"}
                          </TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell>
                            {transaction.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsPaid(transaction)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardContent className="pt-6">
                {donations.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Nenhuma doação registrada</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doador</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Recorrente</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.map(donation => (
                        <TableRow key={donation.id}>
                          <TableCell>
                            {donation.is_anonymous ? "Anônimo" : donation.donor_name}
                          </TableCell>
                          <TableCell className="font-medium text-pink-600">
                            R$ {Number(donation.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            {donation.is_recurring ? (
                              <Badge variant="secondary">{donation.recurrence_type}</Badge>
                            ) : (
                              "Única"
                            )}
                          </TableCell>
                          <TableCell>{donation.payment_method || "-"}</TableCell>
                          <TableCell>
                            {format(new Date(donation.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>{getStatusBadge(donation.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
