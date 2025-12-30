import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Church,
  GraduationCap,
  BookOpen,
  Award,
  Users,
  Video,
  MessageSquare,
  Calendar,
  FileText,
  Shield,
  Sparkles,
  Cross,
  ArrowRight,
  CheckCircle2,
  Star,
  Play,
  BookMarked,
  Brain,
  Globe,
  Download,
  MessageCircle,
  ChevronRight,
  Zap,
  Heart,
  Target,
  TrendingUp,
  Clock,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import heroImage from '@/assets/hero-theology.jpg';
import logoImage from '@/assets/logo-pod-seminario.png';

const features = [
  {
    icon: BookOpen,
    title: 'Cursos Teológicos',
    description: 'Formação completa em Teologia, Ministério Pastoral e Liderança Cristã',
    color: 'primary',
  },
  {
    icon: Video,
    title: 'Videoaulas HD',
    description: 'Conteúdo em alta definição com professores renomados',
    color: 'accent',
  },
  {
    icon: Brain,
    title: 'Quizzes Inteligentes',
    description: 'Avaliações geradas por IA para fixação do conteúdo',
    color: 'success',
  },
  {
    icon: Award,
    title: 'Certificados',
    description: 'Certificação reconhecida ao concluir cada módulo',
    color: 'accent',
  },
  {
    icon: BookMarked,
    title: 'Bíblia Interlinear',
    description: 'Estudo aprofundado com Strong\'s em Português',
    color: 'primary',
  },
  {
    icon: Heart,
    title: 'Devocionais Diários',
    description: 'Reflexões espirituais geradas para edificação',
    color: 'destructive',
  },
  {
    icon: FileText,
    title: 'Biblioteca Digital',
    description: 'Milhares de sermões, estudos e materiais de apoio',
    color: 'success',
  },
  {
    icon: MessageCircle,
    title: 'Fórum Comunitário',
    description: 'Discussões teológicas com colegas e professores',
    color: 'accent',
  },
  {
    icon: Calendar,
    title: 'Agenda Integrada',
    description: 'Organize seus estudos e compromissos',
    color: 'primary',
  },
];

const stats = [
  { value: '500+', label: 'Aulas Disponíveis', icon: Video },
  { value: '50+', label: 'Cursos Completos', icon: BookOpen },
  { value: '10k+', label: 'Alunos Formados', icon: GraduationCap },
  { value: '98%', label: 'Satisfação', icon: Star },
];

const testimonials = [
  {
    name: 'Pastor João Silva',
    role: 'Igreja Batista Central',
    content: 'A formação teológica mais completa que já encontrei. Os professores são excepcionais e o conteúdo é profundo.',
    rating: 5,
  },
  {
    name: 'Maria Souza',
    role: 'Líder de Jovens',
    content: 'Os devocionais diários e a bíblia interlinear transformaram meu tempo com Deus. Simplesmente incrível!',
    rating: 5,
  },
  {
    name: 'Rev. Carlos Santos',
    role: 'Igreja Presbiteriana',
    content: 'A plataforma é moderna, intuitiva e o sistema de certificados é muito profissional. Recomendo!',
    rating: 5,
  },
];

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Fixed Navigation */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-background/95 backdrop-blur-md shadow-md py-2'
            : 'bg-transparent py-4'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-sacred flex items-center justify-center">
              <Church className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-lg text-foreground hidden sm:block">
              Seminário Teológico
            </span>
          </div>

          {/* Compact Login Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs sm:text-sm"
            >
              <Link to="/auth?portal=student">
                <GraduationCap className="w-4 h-4 mr-1" />
                <span className="hidden xs:inline">Aluno</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs sm:text-sm border-accent/50 hover:border-accent"
            >
              <Link to="/auth?portal=admin">
                <Shield className="w-4 h-4 mr-1" />
                <span className="hidden xs:inline">Admin</span>
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/90 via-foreground/80 to-background" />

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-accent/30 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
          {/* Badge */}
          <Badge
            variant="outline"
            className="mb-6 px-4 py-2 bg-background/10 backdrop-blur-sm border-accent/40 text-primary-foreground animate-fade-in"
          >
            <Sparkles className="w-4 h-4 mr-2 text-accent" />
            Plataforma de Ensino Teológico mais completa do Brasil
          </Badge>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-primary-foreground mb-6 leading-tight animate-slide-up">
            Formação <span className="text-accent">Teológica</span>
            <br />
            de Excelência
          </h1>

          <p
            className="text-lg sm:text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto mb-8 animate-slide-up"
            style={{ animationDelay: '100ms' }}
          >
            Prepare-se para o ministério com cursos completos, devocionais
            diários, bíblia interlinear e muito mais.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            <Button
              size="lg"
              variant="accent"
              asChild
              className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg shadow-accent/30"
            >
              <Link to="/auth?portal=student">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Play className="w-5 h-5 mr-2" />
              Ver Demonstração
            </Button>
          </div>

          {/* Quick Stats */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-background/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10"
              >
                <stat.icon className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-primary-foreground">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-primary-foreground/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-accent rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Zap className="w-4 h-4 mr-2 text-accent" />
              Funcionalidades
            </Badge>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Tudo que você precisa para sua{' '}
              <span className="text-primary">formação ministerial</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa com recursos avançados para seu
              crescimento espiritual e acadêmico
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="group relative overflow-hidden border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <CardContent className="p-6">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110',
                      feature.color === 'primary' && 'bg-primary/10',
                      feature.color === 'accent' && 'bg-accent/10',
                      feature.color === 'success' && 'bg-success/10',
                      feature.color === 'destructive' && 'bg-destructive/10'
                    )}
                  >
                    <feature.icon
                      className={cn(
                        'w-7 h-7',
                        feature.color === 'primary' && 'text-primary',
                        feature.color === 'accent' && 'text-accent',
                        feature.color === 'success' && 'text-success',
                        feature.color === 'destructive' && 'text-destructive'
                      )}
                    />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bible Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-sacred opacity-95" />
        <div className="absolute inset-0 pattern-cross opacity-10" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-primary-foreground">
              <Badge
                variant="outline"
                className="mb-4 px-4 py-2 border-accent/40 text-accent"
              >
                <BookMarked className="w-4 h-4 mr-2" />
                Recurso Exclusivo
              </Badge>
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
                Bíblia Interlinear com{' '}
                <span className="text-accent">Strong's em Português</span>
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Estude as Escrituras no original com tradução completa dos
                códigos Strong para o Português. Compreenda cada palavra
                hebraica e grega em profundidade.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Concordância Strong completa traduzida',
                  'Múltiplas traduções bíblicas (ACF, ARA, NVI...)',
                  'Comentários de estudo integrados',
                  'Sistema de anotações pessoais',
                  'Favoritos e marcações por versículo',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-primary-foreground/90">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                variant="accent"
                asChild
                className="shadow-lg shadow-accent/30"
              >
                <Link to="/auth?portal=student">
                  Acessar Bíblia
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-3xl" />
              <Card className="relative bg-card/95 backdrop-blur-sm border-accent/30 overflow-hidden">
                <CardContent className="p-6">
                  <div className="bg-muted/50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      João 1:1
                    </p>
                    <p className="text-lg font-serif text-foreground">
                      No{' '}
                      <span className="text-primary underline decoration-accent/50 cursor-help">
                        princípio
                      </span>{' '}
                      era o{' '}
                      <span className="text-primary underline decoration-accent/50 cursor-help">
                        Verbo
                      </span>
                      , e o{' '}
                      <span className="text-primary underline decoration-accent/50 cursor-help">
                        Verbo
                      </span>{' '}
                      estava com{' '}
                      <span className="text-primary underline decoration-accent/50 cursor-help">
                        Deus
                      </span>
                      , e o{' '}
                      <span className="text-primary underline decoration-accent/50 cursor-help">
                        Verbo
                      </span>{' '}
                      era{' '}
                      <span className="text-primary underline decoration-accent/50 cursor-help">
                        Deus
                      </span>
                      .
                    </p>
                  </div>
                  <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        G3056
                      </Badge>
                      <span className="font-semibold text-foreground">
                        λόγος (logos)
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Verbo</strong> - Palavra, discurso, razão divina
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Do grego λέγω (legō) - "falar". Refere-se à expressão do
                      pensamento divino, a segunda pessoa da Trindade.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Star className="w-4 h-4 mr-2 text-accent" />
              Depoimentos
            </Badge>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
              O que nossos <span className="text-primary">alunos dizem</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card
                key={i}
                className={cn(
                  'relative overflow-hidden transition-all duration-500',
                  activeTestimonial === i
                    ? 'border-accent/50 shadow-lg scale-105'
                    : 'border-border/50'
                )}
              >
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 fill-accent text-accent"
                      />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Features */}
      <section className="py-20 md:py-32 relative bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Shield className="w-4 h-4 mr-2 text-accent" />
              Para Administradores
            </Badge>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Painel Administrativo{' '}
              <span className="text-primary">Completo</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gerencie todo o seminário com ferramentas profissionais
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Gestão de Alunos', desc: 'Controle completo' },
              { icon: BookOpen, label: 'Cursos e Aulas', desc: 'CRUD completo' },
              { icon: Brain, label: 'Quizzes com IA', desc: 'Geração automática' },
              { icon: Award, label: 'Certificados PDF', desc: 'Emissão automática' },
              { icon: FileText, label: 'Relatórios', desc: 'Análises detalhadas' },
              { icon: Calendar, label: 'Eventos', desc: 'Agenda integrada' },
              { icon: Download, label: 'Backups', desc: 'Restauração completa' },
              { icon: Lock, label: 'Segurança', desc: 'RLS em todas tabelas' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-accent/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth?portal=admin">
                <Shield className="w-5 h-5 mr-2" />
                Acessar Painel Admin
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute inset-0 pattern-cross opacity-10" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Cross className="w-10 h-10 text-accent" />
          </div>

          <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary-foreground mb-6">
            Comece sua jornada de{' '}
            <span className="text-accent">formação ministerial</span> hoje
          </h2>

          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de ministros que estão se preparando para o
            Reino de Deus com nossa plataforma completa de ensino teológico.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="accent"
              asChild
              className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg shadow-accent/30"
            >
              <Link to="/auth?portal=student">
                <GraduationCap className="w-5 h-5 mr-2" />
                Matricular-se Agora
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Fale Conosco
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-sacred flex items-center justify-center">
                <Church className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-serif font-bold text-foreground">
                  Seminário Teológico
                </p>
                <p className="text-xs text-muted-foreground">
                  Formação ministerial de excelência
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link
                to="/auth?portal=student"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Portal do Aluno
              </Link>
              <Link
                to="/auth?portal=admin"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Área Admin
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Seminário Teológico. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
