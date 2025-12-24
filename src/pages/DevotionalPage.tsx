import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share,
  Bookmark,
  PenLine,
  Clock,
  Sun,
  Moon,
  Sunrise,
  Volume2,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDevotionals } from "@/hooks/useDevotionals";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function DevotionalPage() {
  const { user } = useAuth();
  const { 
    todayDevotional, 
    recentDevotionals, 
    userNotes, 
    isLoading, 
    saveNotes 
  } = useDevotionals();
  
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userNotes) {
      setNotes(userNotes.notes || "");
    }
  }, [userNotes]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { icon: Sunrise, greeting: "Bom dia" };
    if (hour < 18) return { icon: Sun, greeting: "Boa tarde" };
    return { icon: Moon, greeting: "Boa noite" };
  };

  const { icon: TimeIcon, greeting } = getTimeOfDay();

  const handleSaveNotes = async () => {
    if (!todayDevotional) return;
    
    setIsSaving(true);
    try {
      await saveNotes(todayDevotional.id, notes);
      toast.success("Anotações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar anotações");
    } finally {
      setIsSaving(false);
    }
  };

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "Estudante";

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!todayDevotional) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Nenhum devocional disponível
            </h2>
            <p className="text-muted-foreground">
              Volte amanhã para um novo devocional.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const formattedDate = format(new Date(todayDevotional.publish_date), "d 'de' MMMM, yyyy", { locale: ptBR });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TimeIcon className="w-5 h-5 text-accent" />
              <span>{greeting}, {userName}!</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
              Devocional Diário
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{formattedDate}</span>
            </div>
            <Button variant="outline" size="icon">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-accent" />
              <div className="p-6 lg:p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <Badge className="mb-3 bg-primary/10 text-primary">
                      Devocional
                    </Badge>
                    <h2 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">
                      {todayDevotional.title}
                    </h2>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        5 min
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Verse */}
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 border border-primary/10 mb-6">
                  <BookOpen className="w-8 h-8 text-primary mb-4" />
                  <blockquote className="text-lg lg:text-xl font-serif italic text-foreground leading-relaxed">
                    "{todayDevotional.verse_text}"
                  </blockquote>
                  <p className="text-primary font-semibold mt-4">
                    — {todayDevotional.verse_reference}
                  </p>
                </div>

                {/* Reflection */}
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-4">
                    Reflexão
                  </h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {todayDevotional.reflection}
                  </div>
                </div>

                {/* Prayer */}
                {todayDevotional.prayer && (
                  <div className="mt-8 p-6 bg-accent/5 rounded-xl border border-accent/20">
                    <h3 className="text-lg font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
                      🙏 Oração
                    </h3>
                    <p className="text-muted-foreground italic leading-relaxed">
                      {todayDevotional.prayer}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className="gap-2"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                    {isLiked ? "Amei!" : "Gostei"}
                  </Button>
                  <Button
                    variant={isSaved ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsSaved(!isSaved)}
                    className="gap-2"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                    {isSaved ? "Salvo" : "Salvar"}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share className="w-4 h-4" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
                <PenLine className="w-5 h-5 text-primary" />
                Minhas Anotações
              </h3>
              <Textarea
                placeholder="Escreva suas reflexões pessoais sobre o devocional de hoje..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <div className="flex justify-end mt-3">
                <Button size="sm" onClick={handleSaveNotes} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Anotações"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reading Plan Progress */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif font-semibold text-foreground mb-4">
                Plano de Leitura
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Advento 2024</span>
                  <span className="font-medium text-foreground">Dia 24/25</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: "96%" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Faltam apenas 1 dia para completar!
                </p>
              </div>
            </div>

            {/* Previous Devotionals */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-serif font-semibold text-foreground mb-4">
                Devocionais Anteriores
              </h3>
              <div className="space-y-3">
                {recentDevotionals.slice(0, 4).map((dev) => (
                  <button
                    key={dev.id}
                    className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-primary">
                          {format(new Date(dev.publish_date), "dd", { locale: ptBR })}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground line-clamp-1">
                          {dev.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {dev.verse_reference}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-3">
                Ver Todos
              </Button>
            </div>

            {/* Reading Streak */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20 p-5">
              <div className="text-center">
                <div className="text-4xl mb-2">🔥</div>
                <h3 className="font-serif font-bold text-2xl text-foreground">
                  15 dias
                </h3>
                <p className="text-sm text-muted-foreground">
                  de leitura consecutiva
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
