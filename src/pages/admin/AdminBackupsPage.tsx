import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  RefreshCw,
  HardDrive,
  FileArchive,
  AlertTriangle,
  Check
} from "lucide-react";

interface Backup {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  tables_included: string[];
  records_count: Record<string, number> | null;
  created_by: string | null;
  created_at: string;
  notes: string | null;
}

export default function AdminBackupsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [notes, setNotes] = useState("");
  const [clearExisting, setClearExisting] = useState(false);

  // Fetch backups
  const { data: backups, isLoading } = useQuery({
    queryKey: ["backups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backups")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Backup[];
    }
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const response = await supabase.functions.invoke("create-backup", {
        body: { notes }
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Backup criado com sucesso",
        description: `${data.totalRecords} registros salvos.`
      });
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      setIsCreateDialogOpen(false);
      setNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar backup",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Restore backup mutation
  const restoreBackupMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBackup) throw new Error("Nenhum backup selecionado");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const response = await supabase.functions.invoke("restore-backup", {
        body: { backupId: selectedBackup.id, clearExisting }
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Backup restaurado com sucesso",
        description: `${data.totalRestored} registros restaurados.${data.errors ? ` Avisos: ${data.errors.length}` : ''}`
      });
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      setIsRestoreDialogOpen(false);
      setSelectedBackup(null);
      setClearExisting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao restaurar backup",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete backup mutation
  const deleteBackupMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBackup) throw new Error("Nenhum backup selecionado");

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("backups")
        .remove([selectedBackup.file_name]);

      if (storageError) {
        console.warn("Storage delete warning:", storageError);
      }

      // Delete from database
      const { error } = await supabase
        .from("backups")
        .delete()
        .eq("id", selectedBackup.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Backup excluído",
        description: "O backup foi removido com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      setIsDeleteDialogOpen(false);
      setSelectedBackup(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir backup",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTotalRecords = (counts: Record<string, number> | null) => {
    if (!counts) return 0;
    return Object.values(counts).reduce((a, b) => a + b, 0);
  };

  const downloadBackup = async (backup: Backup) => {
    try {
      const { data, error } = await supabase.storage
        .from("backups")
        .download(backup.file_name);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = backup.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download iniciado",
        description: "O arquivo está sendo baixado."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao baixar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Database className="h-8 w-8" />
              Backup e Restauração
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie backups completos do sistema
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Backup
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
              <FileArchive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{backups?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {backups?.[0] 
                  ? format(new Date(backups[0].created_at), "dd/MM/yyyy", { locale: ptBR })
                  : "Nenhum"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Espaço Usado</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatFileSize(backups?.reduce((acc, b) => acc + (b.file_size || 0), 0) || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backups Table */}
        <Card>
          <CardHeader>
            <CardTitle>Backups Salvos</CardTitle>
            <CardDescription>
              Lista de todos os backups disponíveis para restauração
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando backups...
              </div>
            ) : backups?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum backup encontrado. Crie o primeiro backup clicando no botão acima.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Registros</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups?.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-mono text-sm">
                        {backup.file_name}
                      </TableCell>
                      <TableCell>
                        {format(new Date(backup.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatFileSize(backup.file_size)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getTotalRecords(backup.records_count as Record<string, number> | null).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {backup.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadBackup(backup)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setIsRestoreDialogOpen(true);
                            }}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>

      {/* Create Backup Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Backup</DialogTitle>
            <DialogDescription>
              Um backup completo de todas as tabelas será criado e salvo no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Ex: Backup antes da atualização..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-2">Tabelas incluídas:</p>
              <p className="text-muted-foreground">
                Cursos, Aulas, Matrículas, Quizzes, Certificados, Usuários, Biblioteca, Blog, Fórum, Devocionais, e mais...
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => createBackupMutation.mutate()}
              disabled={createBackupMutation.isPending}
            >
              {createBackupMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Criar Backup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Backup Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Restaurar Backup
            </DialogTitle>
            <DialogDescription>
              Você está prestes a restaurar o backup: {selectedBackup?.file_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Atenção!
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                A restauração irá sobrescrever dados existentes. Certifique-se de ter um backup atual antes de continuar.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="clearExisting" 
                checked={clearExisting}
                onCheckedChange={(checked) => setClearExisting(checked as boolean)}
              />
              <Label htmlFor="clearExisting" className="text-sm">
                Limpar dados existentes antes de restaurar
              </Label>
            </div>
            {selectedBackup && (
              <div className="text-sm text-muted-foreground">
                <p>Registros a restaurar: {getTotalRecords(selectedBackup.records_count as Record<string, number> | null).toLocaleString()}</p>
                <p>Data do backup: {format(new Date(selectedBackup.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => restoreBackupMutation.mutate()}
              disabled={restoreBackupMutation.isPending}
            >
              {restoreBackupMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Restaurando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Restaurar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Backup?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O backup "{selectedBackup?.file_name}" será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBackupMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBackupMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
