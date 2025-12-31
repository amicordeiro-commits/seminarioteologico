import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  Download,
  MessageCircle,
  Zap,
  Heart,
  Target,
  TrendingUp,
  Clock,
  Lock,
  Laptop,
  Smartphone,
  Headphones,
  Quote,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import heroImage from '@/assets/hero-theology.jpg';
import { AIChatWidget } from '@/components/chat/AIChatWidget';

const features = [
  {
    icon: BookOpen,
    title: 'Cursos Teológicos',
    description: 'Formação completa em Teologia e Ministério Pastoral',
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
    title: 'Quizzes com IA',
    description: 'Avaliações inteligentes para fixação do conteúdo',
    color: 'success',
  },
  {
    icon: Award,
    title: 'Certificados PDF',
    description: 'Certificação oficial ao concluir cada curso',
    color: 'accent',
  },
  {
    icon: BookMarked,
    title: 'Bíblia Interlinear',
    description: "Strong's completo traduzido para Português",
    color: 'primary',
  },
  {
    icon: Heart,
    title: 'Devocionais IA',
    description: 'Reflexões diárias geradas para edificação',
    color: 'destructive',
  },
];

const stats = [
  { value: '500+', label: 'Aulas', icon: Video },
  { value: '50+', label: 'Cursos', icon: BookOpen },
  { value: '10k+', label: 'Alunos', icon: GraduationCap },
  { value: '98%', label: 'Satisfação', icon: Star },
];

const testimonials = [
  {
    name: 'Pastor João Silva',
    role: 'Igreja Batista Central',
    content: 'A formação teológica mais completa que já encontrei. Os professores são excepcionais.',
    avatar: 'JS',
  },
  {
    name: 'Maria Souza',
    role: 'Líder de Jovens',
    content: 'Os devocionais diários e a bíblia interlinear transformaram meu tempo com Deus!',
    avatar: 'MS',
  },
  {
    name: 'Rev. Carlos Santos',
    role: 'Igreja Presbiteriana',
    content: 'Plataforma moderna, intuitiva e o sistema de certificados é muito profissional.',
    avatar: 'CS',
  },
];

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const { data: blogPosts = [], isLoading: blogLoading } = useBlogPosts(true);
  const navigate = useNavigate();

  const openChat = useCallback(() => setChatOpen(true), []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-background/95 backdrop-blur-lg shadow-lg border-b border-border/50 py-2'
            : 'bg-gradient-to-b from-background/80 to-transparent py-3 md:py-4'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-sacred flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Church className="w-5 h-5 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="font-serif font-bold text-base md:text-lg text-foreground">
                  Seminário
                </span>
                <span className="font-serif font-bold text-base md:text-lg text-primary ml-1">
                  Teológico
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </a>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Depoimentos
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:inline-flex text-xs md:text-sm"
              >
                <Link to="/auth?portal=student">
                  <GraduationCap className="w-4 h-4 mr-1.5" />
                  Aluno
                </Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                asChild
                className="text-xs md:text-sm bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Link to="/auth?portal=admin">
                  <Shield className="w-4 h-4 mr-1.5" />
                  <span className="hidden xs:inline">Admin</span>
                </Link>
              </Button>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4 animate-fade-in">
              <div className="flex flex-col gap-3">
                <Link
                  to="/auth?portal=student"
                  className="flex items-center gap-2 p-3 rounded-lg bg-card hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <span className="font-medium">Portal do Aluno</span>
                </Link>
                <Link
                  to="/auth?portal=admin"
                  className="flex items-center gap-2 p-3 rounded-lg bg-card hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-5 h-5 text-accent" />
                  <span className="font-medium">Painel Admin</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background" />
        
        {/* Animated Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-accent/20 rounded-full blur-[100px] sm:blur-[150px] animate-pulse" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          {/* Badge */}
          <Badge
            variant="outline"
            className="mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 bg-card/50 backdrop-blur-sm border-accent/30 text-foreground animate-fade-in text-xs sm:text-sm"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-accent" />
            Plataforma de Ensino Teológico #1 do Brasil
          </Badge>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-foreground mb-4 sm:mb-6 leading-[1.1] animate-slide-up">
            Formação{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent">
              Teológica
            </span>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            de Excelência
          </h1>

          <p
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 animate-slide-up px-2"
            style={{ animationDelay: '100ms' }}
          >
            Prepare-se para o ministério com cursos completos, devocionais diários, 
            bíblia interlinear e certificados reconhecidos.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-slide-up mb-10 sm:mb-16"
            style={{ animationDelay: '200ms' }}
          >
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl shadow-accent/25 hover:shadow-accent/40 transition-all hover:scale-105"
            >
              <Link to="/auth?portal=student">
                Começar Agora
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-border/50 hover:bg-card/50"
              onClick={openChat}
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Fale Conosco
            </Button>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border/30 hover:border-accent/30 transition-colors group"
              >
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent mx-auto mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="outline" className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-accent" />
              Funcionalidades
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3 sm:mb-4 px-2">
              Tudo para sua{' '}
              <span className="text-primary">formação ministerial</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto px-4">
              Recursos avançados para seu crescimento espiritual e acadêmico
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="group relative overflow-hidden border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <CardContent className="p-5 sm:p-6">
                  <div
                    className={cn(
                      'w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110',
                      feature.color === 'primary' && 'bg-primary/15',
                      feature.color === 'accent' && 'bg-accent/15',
                      feature.color === 'success' && 'bg-success/15',
                      feature.color === 'destructive' && 'bg-destructive/15'
                    )}
                  >
                    <feature.icon
                      className={cn(
                        'w-6 h-6 sm:w-7 sm:h-7',
                        feature.color === 'primary' && 'text-primary',
                        feature.color === 'accent' && 'text-accent',
                        feature.color === 'success' && 'text-success',
                        feature.color === 'destructive' && 'text-destructive'
                      )}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-foreground mb-1.5 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bible Section */}
      <section className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 gradient-sacred" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-primary-foreground order-2 lg:order-1">
              <Badge
                variant="outline"
                className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 border-accent/40 text-accent text-xs sm:text-sm"
              >
                <BookMarked className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Recurso Exclusivo
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 sm:mb-6">
                Bíblia Interlinear com{' '}
                <span className="text-accent">Strong's em Português</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-primary-foreground/80 mb-6 sm:mb-8">
                Estude as Escrituras no original com tradução completa dos
                códigos Strong para o Português.
              </p>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {[
                  'Concordância Strong completa',
                  'Múltiplas traduções (ACF, ARA, NVI...)',
                  'Comentários de estudo integrados',
                  'Anotações e favoritos por versículo',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                    <span className="text-sm sm:text-base text-primary-foreground/90">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
              >
                <Link to="/auth?portal=student">
                  Acessar Bíblia
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 bg-accent/20 rounded-2xl sm:rounded-3xl blur-3xl" />
              <Card className="relative bg-card/95 backdrop-blur-sm border-accent/30 overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
                      João 1:1
                    </p>
                    <p className="text-sm sm:text-lg font-serif text-foreground leading-relaxed">
                      No{' '}
                      <span className="text-primary underline decoration-accent/50 decoration-2 cursor-help">
                        princípio
                      </span>{' '}
                      era o{' '}
                      <span className="text-primary underline decoration-accent/50 decoration-2 cursor-help">
                        Verbo
                      </span>
                      , e o Verbo estava com{' '}
                      <span className="text-primary underline decoration-accent/50 decoration-2 cursor-help">
                        Deus
                      </span>
                      , e o Verbo era Deus.
                    </p>
                  </div>
                  <div className="bg-accent/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">
                        G3056
                      </Badge>
                      <span className="font-semibold text-foreground text-sm sm:text-base">
                        λόγος (logos)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <strong>Verbo</strong> - Palavra, discurso, razão divina
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 md:py-28 relative bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="outline" className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-accent" />
              Como Funciona
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3 sm:mb-4">
              Sua jornada em <span className="text-primary">4 passos</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { step: '01', icon: Users, title: 'Matricule-se', desc: 'Crie sua conta gratuita' },
              { step: '02', icon: Video, title: 'Estude', desc: 'Assista às videoaulas' },
              { step: '03', icon: Brain, title: 'Pratique', desc: 'Complete os quizzes' },
              { step: '04', icon: Award, title: 'Certifique-se', desc: 'Baixe seu certificado' },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-center h-full">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent flex items-center justify-center text-[10px] sm:text-xs font-bold text-accent-foreground shadow-lg">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mt-2 sm:mt-4 mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="text-sm sm:text-lg font-serif font-semibold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="outline" className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-accent" />
              Depoimentos
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground">
              O que nossos <span className="text-primary">alunos dizem</span>
            </h2>
          </div>

          {/* Mobile: Carousel / Desktop: Grid */}
          <div className="block sm:hidden">
            <Card className="bg-card border-accent/30 shadow-xl">
              <CardContent className="p-5">
                <Quote className="w-8 h-8 text-accent/30 mb-3" />
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground mb-4 italic text-sm leading-relaxed">
                  "{testimonials[activeTestimonial].content}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {testimonials[activeTestimonial].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonials[activeTestimonial].role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    activeTestimonial === i ? 'w-6 bg-accent' : 'bg-border'
                  )}
                />
              ))}
            </div>
          </div>

          <div className="hidden sm:grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card
                key={i}
                className={cn(
                  'bg-card/80 border-border/50 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1'
                )}
              >
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-accent/30 mb-4" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-16 sm:py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="outline" className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-accent" />
              Blog & Devocionais
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3 sm:mb-4">
              Reflexões para <span className="text-primary">edificação</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Artigos, estudos e devocionais para seu crescimento espiritual
            </p>
          </div>

          {blogLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : blogPosts.length === 0 ? (
            <Card className="text-center py-12 bg-card/60 backdrop-blur-sm">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-medium mb-2">Em breve</h3>
                <p className="text-muted-foreground">
                  Novos artigos e devocionais estão a caminho!
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {blogPosts.slice(0, 6).map((post) => (
                  <Card
                    key={post.id}
                    className="group cursor-pointer overflow-hidden border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
                    onClick={() => navigate(`/blog/${post.id}`)}
                  >
                    {post.featured_image && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {format(
                            new Date(post.published_at || post.created_at),
                            "dd MMM yyyy",
                            { locale: ptBR }
                          )}
                        </span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {blogPosts.length > 6 && (
                <div className="text-center mt-8 sm:mt-12">
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/blog">
                      Ver todos os artigos
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}

          {blogPosts.length > 0 && blogPosts.length <= 6 && (
            <div className="text-center mt-8 sm:mt-12">
              <Button size="lg" variant="outline" asChild>
                <Link to="/blog">
                  Ver todos os artigos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-28 relative bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="outline" className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-accent" />
              Administradores
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3 sm:mb-4">
              Painel Admin <span className="text-primary">Completo</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Gerencie todo o seminário com ferramentas profissionais
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Users, label: 'Gestão de Alunos' },
              { icon: BookOpen, label: 'Cursos e Aulas' },
              { icon: Brain, label: 'Quizzes com IA' },
              { icon: Award, label: 'Certificados' },
              { icon: FileText, label: 'Relatórios' },
              { icon: Calendar, label: 'Eventos' },
              { icon: Download, label: 'Backups' },
              { icon: Lock, label: 'Segurança RLS' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-card border border-border/50 hover:border-accent/40 hover:shadow-lg transition-all group"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/auth?portal=admin">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Acessar Painel Admin
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
            <Cross className="w-7 h-7 sm:w-10 sm:h-10 text-accent" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-4 sm:mb-6 px-2">
            Comece sua jornada{' '}
            <span className="text-accent">ministerial</span> hoje
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-primary-foreground/80 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Junte-se a milhares de ministros que estão se preparando para o Reino de Deus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl"
            >
              <Link to="/auth?portal=student">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Matricular-se Agora
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={openChat}
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Fale Conosco
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 sm:mt-12 text-primary-foreground/70 text-xs sm:text-sm">
            {[
              { icon: CheckCircle2, text: 'Acesso Imediato' },
              { icon: Headphones, text: 'Suporte 24/7' },
              { icon: Award, text: 'Certificado Incluso' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-sacred flex items-center justify-center">
                <Church className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-serif font-bold text-foreground text-sm sm:text-base">
                  Seminário Teológico
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Formação ministerial de excelência
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link
                to="/auth?portal=student"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Portal do Aluno
              </Link>
              <Link
                to="/auth?portal=admin"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Área Admin
              </Link>
            </div>

            <p className="text-[10px] sm:text-xs text-muted-foreground text-center sm:text-right">
              © {new Date().getFullYear()} Seminário Teológico
              <span className="hidden sm:inline"> • Feito com ❤️ para o Reino</span>
            </p>
          </div>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <AIChatWidget externalOpen={chatOpen} onExternalOpenChange={setChatOpen} />
    </div>
  );
};

export default LandingPage;
