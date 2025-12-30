import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Users, UserPlus, Phone, Mail, MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { useAdmissionLeads, useCreateLead, useUpdateLead, useDeleteLead, AdmissionLead } from "@/hooks/useAdmissions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function AdminAdmissionsPage() {
  const { data: leads = [], isLoading } = useAdmissionLeads();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<AdmissionLead | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    interest_course: "",
    how_found_us: "",
    notes: "",
    status: "new",
  });

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      interest_course: "",
      how_found_us: "",
      notes: "",
      status: "new",
    });
  };

  const handleCreate = async () => {
    try {
      await createLead.mutateAsync(formData as any);
      toast.success("Lead criado com sucesso!");
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao criar lead");
    }
  };

  const handleUpdate = async () => {
    if (!editingLead) return;
    try {
      await updateLead.mutateAsync({ id: editingLead.id, ...formData } as any);
      toast.success("Lead atualizado!");
      setEditingLead(null);
      resetForm();
    } catch (error) {
      toast.error("Erro ao atualizar lead");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;
    try {
      await deleteLead.mutateAsync(id);
      toast.success("Lead excluído!");
    } catch (error) {
      toast.error("Erro ao excluir lead");
    }
  };

  const openEdit = (lead: AdmissionLead) => {
    setEditingLead(lead);
    setFormData({
      full_name: lead.full_name,
      email: lead.email,
      phone: lead.phone || "",
      city: lead.city || "",
      state: lead.state || "",
      interest_course: lead.interest_course || "",
      how_found_us: lead.how_found_us || "",
      notes: lead.notes || "",
      status: lead.status,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500">Novo</Badge>;
      case "contacted":
        return <Badge variant="secondary">Contactado</Badge>;
      case "interested":
        return <Badge className="bg-yellow-500">Interessado</Badge>;
      case "enrolled":
        return <Badge className="bg-green-500">Matriculado</Badge>;
      case "declined":
        return <Badge variant="destructive">Recusado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const statusCount = {
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    interested: leads.filter(l => l.status === "interested").length,
    enrolled: leads.filter(l => l.status === "enrolled").length,
  };

  if (isLoading) {
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

  const LeadForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome Completo *</Label>
          <Input
            value={formData.full_name}
            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Nome do candidato"
          />
        </div>
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@exemplo.com"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(00) 00000-0000"
          />
        </div>
        <div className="space-y-2">
          <Label>Curso de Interesse</Label>
          <Input
            value={formData.interest_course}
            onChange={e => setFormData({ ...formData, interest_course: e.target.value })}
            placeholder="Bacharelado em Teologia"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input
            value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Input
            value={formData.state}
            onChange={e => setFormData({ ...formData, state: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Como nos encontrou?</Label>
          <Select
            value={formData.how_found_us}
            onValueChange={v => setFormData({ ...formData, how_found_us: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="social">Redes Sociais</SelectItem>
              <SelectItem value="indication">Indicação</SelectItem>
              <SelectItem value="church">Igreja</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={v => setFormData({ ...formData, status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Novo</SelectItem>
              <SelectItem value="contacted">Contactado</SelectItem>
              <SelectItem value="interested">Interessado</SelectItem>
              <SelectItem value="enrolled">Matriculado</SelectItem>
              <SelectItem value="declined">Recusado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Anotações sobre o contato..."
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-primary" />
              Admissões
            </h1>
            <p className="text-muted-foreground">Gerencie leads e candidatos</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" /> Novo Lead</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Lead</DialogTitle>
              </DialogHeader>
              <LeadForm />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={!formData.full_name || !formData.email}>
                  Criar Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Novos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statusCount.new}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Contactados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCount.contacted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Interessados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statusCount.interested}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Matriculados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statusCount.enrolled}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            {leads.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum lead cadastrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Interesse</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map(lead => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.full_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {lead.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{lead.interest_course || "-"}</TableCell>
                      <TableCell>{lead.how_found_us || "-"}</TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(lead)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(lead.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Lead</DialogTitle>
            </DialogHeader>
            <LeadForm />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditingLead(null)}>Cancelar</Button>
              <Button onClick={handleUpdate}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
