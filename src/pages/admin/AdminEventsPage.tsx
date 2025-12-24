import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  start_time: string;
  end_time: string | null;
  is_public: boolean | null;
}

const defaultEvent: Partial<CalendarEvent> = {
  title: "",
  description: "",
  event_type: "class",
  start_time: new Date().toISOString().slice(0, 16),
  is_public: true,
};

export default function AdminEventsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("start_time", { ascending: false });

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (event: Partial<CalendarEvent>) => {
      if (event.id) {
        const { error } = await supabase
          .from("calendar_events")
          .update({
            title: event.title,
            description: event.description,
            event_type: event.event_type,
            start_time: event.start_time,
            end_time: event.end_time,
            is_public: event.is_public,
          })
          .eq("id", event.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("calendar_events").insert({
          title: event.title!,
          description: event.description,
          event_type: event.event_type,
          start_time: event.start_time!,
          end_time: event.end_time,
          is_public: event.is_public,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({ title: "Evento salvo com sucesso!" });
      setIsDialogOpen(false);
      setEditingEvent(null);
    },
    onError: () => {
      toast({ title: "Erro ao salvar evento", variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({ title: "Evento excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir evento", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!editingEvent?.title || !editingEvent?.start_time) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    saveMutation.mutate(editingEvent);
  };

  const getEventTypeBadge = (type: string | null) => {
    const types: Record<string, { label: string; className: string }> = {
      class: { label: "Aula", className: "bg-blue-500" },
      deadline: { label: "Prazo", className: "bg-red-500" },
      quiz: { label: "Quiz", className: "bg-purple-500" },
      event: { label: "Evento", className: "bg-green-500" },
      mentoring: { label: "Mentoria", className: "bg-amber-500" },
    };
    const config = types[type || "event"] || types.event;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              Gerenciar Eventos
            </h1>
            <p className="text-muted-foreground mt-1">
              {events.length} eventos cadastrados
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingEvent(defaultEvent);
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </Button>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getEventTypeBadge(event.event_type)}
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.start_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingEvent({
                            ...event,
                            start_time: new Date(event.start_time).toISOString().slice(0, 16),
                            end_time: event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : undefined,
                          });
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(event.id)}
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingEvent?.id ? "Editar Evento" : "Novo Evento"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={editingEvent?.title || ""}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingEvent?.description || ""}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Evento</Label>
                <Select
                  value={editingEvent?.event_type || "class"}
                  onValueChange={(value) =>
                    setEditingEvent({ ...editingEvent, event_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class">Aula</SelectItem>
                    <SelectItem value="deadline">Prazo</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                    <SelectItem value="mentoring">Mentoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início *</Label>
                  <Input
                    type="datetime-local"
                    value={editingEvent?.start_time || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, start_time: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input
                    type="datetime-local"
                    value={editingEvent?.end_time || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, end_time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingEvent?.is_public || false}
                  onCheckedChange={(checked) =>
                    setEditingEvent({ ...editingEvent, is_public: checked })
                  }
                />
                <Label>Evento Público</Label>
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
