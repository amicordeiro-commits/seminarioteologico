import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Church, Mail, Lock, User, BookOpen, Shield, GraduationCap, ArrowLeft, Sparkles, Users, Cross } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres');
const nameSchema = z.string().min(2, 'Nome deve ter pelo menos 2 caracteres');

type PortalType = 'student' | 'admin' | null;

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [selectedPortal, setSelectedPortal] = useState<PortalType>(null);
  
  const { signIn, signUp, user, loading } = useAuth();
  const { isAdmin, isLoading: loadingRole } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !loadingRole && user) {
      if (selectedPortal === 'admin' && isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, loading, loadingRole, navigate, selectedPortal, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Erro de validação',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      let message = 'Erro ao fazer login. Tente novamente.';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email ou senha incorretos.';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Por favor, confirme seu email antes de fazer login.';
      }
      toast({
        title: 'Erro no login',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Bem-vindo!',
        description: selectedPortal === 'admin' ? 'Acesso administrativo concedido.' : 'Login realizado com sucesso.',
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      nameSchema.parse(registerName);
      emailSchema.parse(registerEmail);
      passwordSchema.parse(registerPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Erro de validação',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(registerEmail, registerPassword, registerName);
    setIsLoading(false);

    if (error) {
      let message = 'Erro ao criar conta. Tente novamente.';
      if (error.message.includes('User already registered')) {
        message = 'Este email já está cadastrado. Faça login.';
      }
      toast({
        title: 'Erro no cadastro',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Conta criada!',
        description: 'Bem-vindo ao Seminário Teológico.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-sacred flex items-center justify-center animate-scale-in">
            <Church className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground animate-fade-in">Carregando...</p>
        </div>
      </div>
    );
  }

  // Portal Selection Screen
  if (!selectedPortal) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
        <div className="absolute inset-0 pattern-cross opacity-20" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        
        {/* Decorative Lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
          {/* Logo Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="relative inline-block mb-6">
              {/* Glow effect */}
              <div className="absolute inset-0 w-24 h-24 bg-accent/30 rounded-full blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full gradient-sacred shadow-2xl flex items-center justify-center border-2 border-accent/20">
                <Church className="w-12 h-12 text-primary-foreground drop-shadow-lg" />
              </div>
              {/* Decorative cross */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg">
                <Cross className="w-4 h-4 text-accent-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4 tracking-tight">
              Seminário <span className="text-primary">Teológico</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Formação ministerial de excelência para o <span className="text-accent font-semibold">Reino de Deus</span>
            </p>
          </div>

          {/* Portal Cards */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl w-full px-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {/* Student Portal */}
            <Card 
              className="group cursor-pointer relative overflow-hidden border-2 border-transparent hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 bg-card/80 backdrop-blur-sm"
              onClick={() => setSelectedPortal('student')}
            >
              {/* Card Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                      <GraduationCap className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </div>
                  <Sparkles className="w-6 h-6 text-accent opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-serif">
                  Portal do Aluno
                </CardTitle>
                <CardDescription className="text-base md:text-lg mt-2">
                  Acesse seus cursos, acompanhe seu progresso e participe da comunidade
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Cursos Online', 'Certificados', 'Biblioteca', 'Devocional'].map((tag, i) => (
                    <span 
                      key={tag}
                      className="px-4 py-1.5 bg-secondary/80 rounded-full text-sm font-medium text-secondary-foreground border border-border/50 group-hover:border-primary/30 transition-colors"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Milhares de alunos ativos</span>
                </div>
              </CardContent>
            </Card>

            {/* Admin Portal */}
            <Card 
              className="group cursor-pointer relative overflow-hidden border-2 border-transparent hover:border-accent/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2 bg-card/80 backdrop-blur-sm"
              onClick={() => setSelectedPortal('admin')}
            >
              {/* Card Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-accent/80 to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                      <Shield className="w-10 h-10 text-accent-foreground" />
                    </div>
                  </div>
                  <Sparkles className="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-serif">
                  Painel Administrativo
                </CardTitle>
                <CardDescription className="text-base md:text-lg mt-2">
                  Gerencie cursos, usuários e todo o conteúdo do seminário
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Gestão de Cursos', 'Relatórios', 'Controle Total', 'Análises'].map((tag, i) => (
                    <span 
                      key={tag}
                      className="px-4 py-1.5 bg-accent/10 rounded-full text-sm font-medium text-foreground border border-accent/20 group-hover:border-accent/40 transition-colors"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Acesso restrito a administradores</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/50">
              <BookOpen className="w-5 h-5 text-accent" />
              <span className="italic text-muted-foreground">"Lâmpada para os meus pés é a tua palavra"</span>
              <span className="text-primary font-medium">- Salmos 119:105</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login/Register Form
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
      <div className="absolute inset-0 pattern-cross opacity-15" />
      
      {/* Floating Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md animate-scale-in">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPortal(null)}
            className="mb-6 text-muted-foreground hover:text-foreground group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </Button>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className={`absolute inset-0 rounded-full blur-xl ${
                selectedPortal === 'admin' ? 'bg-accent/30' : 'bg-primary/30'
              } animate-pulse`} />
              <div className={`relative w-20 h-20 rounded-full shadow-2xl flex items-center justify-center ${
                selectedPortal === 'admin' 
                  ? 'gradient-accent' 
                  : 'gradient-sacred'
              }`}>
                {selectedPortal === 'admin' ? (
                  <Shield className="w-10 h-10 text-accent-foreground" />
                ) : (
                  <Church className="w-10 h-10 text-primary-foreground" />
                )}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {selectedPortal === 'admin' ? 'Painel Admin' : 'Portal do Aluno'}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {selectedPortal === 'admin' 
                ? 'Acesso administrativo ao sistema' 
                : 'Seminário Teológico'
              }
            </p>
          </div>

          <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95 overflow-hidden">
            {/* Top accent */}
            <div className={`h-1 w-full ${
              selectedPortal === 'admin' 
                ? 'bg-gradient-to-r from-accent via-accent/80 to-primary' 
                : 'bg-gradient-to-r from-primary via-primary/80 to-accent'
            }`} />
            
            <Tabs defaultValue="login" className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                  <TabsTrigger value="login" className="data-[state=active]:bg-background">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    disabled={selectedPortal === 'admin'}
                    className="data-[state=active]:bg-background disabled:opacity-50"
                  >
                    Cadastrar
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pb-8">
                {/* Login Tab */}
                <TabsContent value="login" className="mt-0 space-y-6">
                  <div>
                    <CardTitle className="text-xl mb-1">Bem-vindo de volta!</CardTitle>
                    <CardDescription>
                      {selectedPortal === 'admin' 
                        ? 'Entre com suas credenciais de administrador.'
                        : 'Entre com suas credenciais para acessar o portal.'
                      }
                    </CardDescription>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-11 h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium">Senha</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-11 h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className={`w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all ${
                        selectedPortal === 'admin' 
                          ? 'gradient-accent text-accent-foreground hover:opacity-90' 
                          : 'gradient-primary text-primary-foreground hover:opacity-90'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Entrando...
                        </span>
                      ) : 'Entrar'}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Tab - Only for students */}
                <TabsContent value="register" className="mt-0 space-y-6">
                  <div>
                    <CardTitle className="text-xl mb-1">Criar conta</CardTitle>
                    <CardDescription>
                      Junte-se à nossa comunidade de estudantes.
                    </CardDescription>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-sm font-medium">Nome completo</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Seu nome"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="pl-11 h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm font-medium">Email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="pl-11 h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm font-medium">Senha</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="pl-11 h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm" className="text-sm font-medium">Confirmar senha</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="register-confirm"
                          type="password"
                          placeholder="Repita a senha"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          className="pl-11 h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold gradient-primary text-primary-foreground shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Criando conta...
                        </span>
                      ) : 'Criar conta'}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="italic">"Lâmpada para os meus pés é a tua palavra"</span>
              <span className="text-primary">- Salmos 119:105</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
