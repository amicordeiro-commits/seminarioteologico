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
} from "lucide-react";
import { useState } from "react";

const devotionals = [
  {
    id: 1,
    date: "24 de Dezembro, 2024",
    title: "A Esperança do Advento",
    verse: "Porque um menino nos nasceu, um filho nos foi dado, e o governo está sobre os seus ombros. E ele será chamado Maravilhoso Conselheiro, Deus Poderoso, Pai Eterno, Príncipe da Paz.",
    reference: "Isaías 9:6",
    reflection: `Neste período de Advento, somos convidados a refletir sobre a grandeza da promessa cumprida em Cristo Jesus. O profeta Isaías, escrevendo séculos antes do nascimento de Jesus, já anunciava a vinda daquele que traria esperança e redenção à humanidade.

Os títulos dados ao Messias revelam aspectos fundamentais de Sua natureza e missão:

**Maravilhoso Conselheiro** - Em meio às nossas incertezas, Ele nos guia com sabedoria perfeita.

**Deus Poderoso** - Não há desafio grande demais para Aquele que criou o universo.

**Pai Eterno** - Seu amor paternal é constante e eterno, nunca nos abandona.

**Príncipe da Paz** - Em um mundo de conflitos, Ele é nossa paz verdadeira.

Que neste dia possamos descansar na certeza de que o mesmo Deus que cumpriu Suas promessas no passado continua fiel para cumprir cada promessa em nossas vidas.`,
    prayer: "Senhor, obrigado por cumprir Tuas promessas através de Jesus Cristo. Ajuda-me a descansar em Tua fidelidade e a viver cada dia na esperança que vem de Ti. Que eu possa refletir Teu amor e paz para aqueles ao meu redor. Em nome de Jesus, amém.",
    author: "Dr. Paulo Mendes",
    category: "Advento",
    readTime: "5 min",
  },
];

const previousDevotionals = [
  { id: 2, date: "23 Dez", title: "Preparando o Caminho", reference: "Mateus 3:3" },
  { id: 3, date: "22 Dez", title: "A Fé de Maria", reference: "Lucas 1:38" },
  { id: 4, date: "21 Dez", title: "O Silêncio de Zacarias", reference: "Lucas 1:20" },
  { id: 5, date: "20 Dez", title: "A Promessa Cumprida", reference: "Gálatas 4:4" },
];

export default function DevotionalPage() {
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const devotional = devotionals[0];

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { icon: Sunrise, greeting: "Bom dia" };
    if (hour < 18) return { icon: Sun, greeting: "Boa tarde" };
    return { icon: Moon, greeting: "Boa noite" };
  };

  const { icon: TimeIcon, greeting } = getTimeOfDay();

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TimeIcon className="w-5 h-5 text-accent" />
              <span>{greeting}, Samuel!</span>
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
              <span className="text-sm font-medium">{devotional.date}</span>
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
                      {devotional.category}
                    </Badge>
                    <h2 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">
                      {devotional.title}
                    </h2>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {devotional.readTime}
                      </span>
                      <span>Por {devotional.author}</span>
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
                    "{devotional.verse}"
                  </blockquote>
                  <p className="text-primary font-semibold mt-4">
                    — {devotional.reference}
                  </p>
                </div>

                {/* Reflection */}
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-4">
                    Reflexão
                  </h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {devotional.reflection}
                  </div>
                </div>

                {/* Prayer */}
                <div className="mt-8 p-6 bg-accent/5 rounded-xl border border-accent/20">
                  <h3 className="text-lg font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
                    🙏 Oração
                  </h3>
                  <p className="text-muted-foreground italic leading-relaxed">
                    {devotional.prayer}
                  </p>
                </div>

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
                <Button size="sm">Salvar Anotações</Button>
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
                {previousDevotionals.map((dev) => (
                  <button
                    key={dev.id}
                    className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-primary">
                          {dev.date.split(" ")[0]}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground line-clamp-1">
                          {dev.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {dev.reference}
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
