import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Devotional {
  id: string;
  title: string;
  verse_reference: string;
  verse_text: string;
  reflection: string;
  prayer: string | null;
  publish_date: string;
}

const today = new Date().toISOString().split("T")[0];
const defaultDevotional: Partial<Devotional> = {
  title: "",
  verse_reference: "",
  verse_text: "",
  reflection: "",
  prayer: "",
  publish_date: today,
};

export default function AdminDevotionalsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDevotional, setEditingDevotional] = useState<Partial<Devotional> | null>(null);

  // Fetch devotionals
  const { data: devotionals = [], isLoading } = useQuery({
    queryKey: ["admin-devotionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .order("publish_date", { ascending: false });

      if (error) throw error;
      return data as Devotional[];
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (devotional: Partial<Devotional>) => {
      if (devotional.id) {
        const { error } = await supabase
          .from("devotionals")
          .update({
            title: devotional.title,
            verse_reference: devotional.verse_reference,
            verse_text: devotional.verse_text,
            reflection: devotional.reflection,
            prayer: devotional.prayer,
            publish_date: devotional.publish_date,
          })
          .eq("id", devotional.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("devotionals").insert({
          title: devotional.title!,
          verse_reference: devotional.verse_reference!,
          verse_text: devotional.verse_text!,
          reflection: devotional.reflection!,
          prayer: devotional.prayer,
          publish_date: devotional.publish_date!,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-devotionals"] });
      toast({ title: "Devocional salvo com sucesso!" });
      setIsDialogOpen(false);
      setEditingDevotional(null);
    },
    onError: () => {
      toast({ title: "Erro ao salvar devocional", variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("devotionals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-devotionals"] });
      toast({ title: "Devocional excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir devocional", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!editingDevotional?.title || !editingDevotional?.verse_reference || !editingDevotional?.verse_text || !editingDevotional?.reflection) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    saveMutation.mutate(editingDevotional);
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              Gerenciar Devocionais
            </h1>
            <p className="text-muted-foreground mt-1">
              {devotionals.length} devocionais cadastrados
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingDevotional(defaultDevotional);
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Devocional
          </Button>
        </div>

        {/* Devotionals List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {devotionals.map((devotional) => (
              <Card key={devotional.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{devotional.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {devotional.verse_reference} • {format(new Date(devotional.publish_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingDevotional(devotional);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(devotional.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDevotional?.id ? "Editar Devocional" : "Novo Devocional"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={editingDevotional?.title || ""}
                    onChange={(e) =>
                      setEditingDevotional({ ...editingDevotional, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Publicação *</Label>
                  <Input
                    type="date"
                    value={editingDevotional?.publish_date || ""}
                    onChange={(e) =>
                      setEditingDevotional({ ...editingDevotional, publish_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Referência Bíblica *</Label>
                <Input
                  value={editingDevotional?.verse_reference || ""}
                  onChange={(e) =>
                    setEditingDevotional({ ...editingDevotional, verse_reference: e.target.value })
                  }
                  placeholder="Ex: João 3:16"
                />
              </div>
              <div className="space-y-2">
                <Label>Texto do Versículo *</Label>
                <Textarea
                  value={editingDevotional?.verse_text || ""}
                  onChange={(e) =>
                    setEditingDevotional({ ...editingDevotional, verse_text: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Reflexão *</Label>
                <Textarea
                  value={editingDevotional?.reflection || ""}
                  onChange={(e) =>
                    setEditingDevotional({ ...editingDevotional, reflection: e.target.value })
                  }
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Oração</Label>
                <Textarea
                  value={editingDevotional?.prayer || ""}
                  onChange={(e) =>
                    setEditingDevotional({ ...editingDevotional, prayer: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
