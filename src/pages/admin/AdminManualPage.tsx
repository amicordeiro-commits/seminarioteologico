import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  FileText,
  MessageSquare,
  Award,
  Download,
  Settings,
  BarChart3,
  Languages,
  PlayCircle,
  ClipboardList,
  Library,
  Newspaper,
  HelpCircle,
} from "lucide-react";

const manualSections = [
  {
    id: "dashboard",
    icon: BarChart3,
    title: "Painel Principal (Dashboard)",
    content: `O painel principal fornece uma visão geral do sistema:

**Estatísticas Gerais:**
- Total de usuários cadastrados
- Cursos ativos no sistema
- Certificados emitidos
- Eventos programados

**Atividades Recentes:**
- Novas matrículas
- Cursos concluídos
- Mensagens recebidas

**Dica:** Use o dashboard para monitorar a saúde geral do sistema e identificar tendências.`,
  },
  {
    id: "users",
    icon: Users,
    title: "Gerenciamento de Usuários",
    content: `Controle completo sobre os usuários do sistema:

**Listagem de Usuários:**
- Visualize todos os usuários cadastrados
- Filtre por nome, email ou tipo de curso
- Veja data de cadastro e status

**Ações Disponíveis:**
- Editar informações do perfil
- Alterar papéis (Admin, Instrutor, Aluno)
- Desativar contas quando necessário

**Papéis do Sistema:**
- **Admin:** Acesso total a todas as funcionalidades
- **Instrutor:** Pode gerenciar cursos e conteúdos
- **Aluno:** Acesso às áreas de aprendizado`,
  },
  {
    id: "enrollments",
    icon: GraduationCap,
    title: "Matrículas",
    content: `Gerencie as matrículas dos alunos nos cursos:

**Visualização:**
- Lista completa de matrículas
- Progresso de cada aluno
- Data de matrícula

**Ações:**
- Matricular novos alunos
- Remover matrículas
- Acompanhar progresso

**Dica:** Monitore alunos com baixo progresso para oferecer suporte.`,
  },
  {
    id: "courses",
    icon: BookOpen,
    title: "Cursos",
    content: `Crie e gerencie cursos teológicos:

**Criar Novo Curso:**
1. Clique em "Novo Curso"
2. Preencha título, descrição e categoria
3. Defina instrutor e carga horária
4. Adicione imagem de capa (opcional)
5. Marque como publicado quando pronto

**Editar Cursos:**
- Altere qualquer informação do curso
- Adicione ou remova aulas
- Ative/desative cursos

**Categorias Disponíveis:**
- Teologia Sistemática
- Estudos Bíblicos
- História da Igreja
- E outras...`,
  },
  {
    id: "lessons",
    icon: PlayCircle,
    title: "Aulas",
    content: `Gerencie o conteúdo das aulas:

**Criar Aula:**
1. Selecione o curso
2. Defina título e descrição
3. Adicione vídeo (URL do YouTube/Vimeo)
4. Escreva o conteúdo textual
5. Defina a ordem da aula

**Campos Importantes:**
- **Vídeo URL:** Link do vídeo da aula
- **Duração:** Tempo estimado em minutos
- **Gratuita:** Marque para aulas de demonstração

**Dica:** Organize as aulas em ordem lógica de aprendizado.`,
  },
  {
    id: "quizzes",
    icon: ClipboardList,
    title: "Quizzes (Avaliações)",
    content: `Crie avaliações para os cursos:

**Criar Quiz:**
1. Selecione o curso e aula (opcional)
2. Defina título e descrição
3. Configure nota mínima para aprovação
4. Defina tempo limite (opcional)

**Adicionar Perguntas:**
1. Abra o quiz criado
2. Clique em "Adicionar Pergunta"
3. Escreva a pergunta
4. Adicione as opções de resposta
5. Marque a resposta correta

**Publicação:**
- Marque o quiz como publicado quando pronto
- Alunos só verão quizzes publicados`,
  },
  {
    id: "certificates",
    icon: Award,
    title: "Certificados",
    content: `Gerencie certificados de conclusão:

**Emissão Automática:**
- Certificados são gerados automaticamente quando o aluno completa 100% do curso

**Visualização:**
- Veja todos os certificados emitidos
- Filtre por curso ou aluno
- Visualize número do certificado

**Download:**
- Baixe certificados em PDF
- Escolha entre diferentes estilos (Dourado, Azul, Verde, Vinho)

**Dica:** Certificados possuem número único para validação.`,
  },
  {
    id: "library",
    icon: Library,
    title: "Biblioteca",
    content: `Gerencie materiais de apoio:

**Tipos de Materiais:**
- PDFs e documentos
- Artigos e textos
- Links externos

**Adicionar Material:**
1. Clique em "Novo Material"
2. Preencha título e descrição
3. Selecione a categoria
4. Faça upload do arquivo ou adicione link
5. Vincule a um curso (opcional)

**Categorias:**
- Sermões
- Estudos Bíblicos
- Comentários
- E outras...`,
  },
  {
    id: "events",
    icon: Calendar,
    title: "Eventos",
    content: `Gerencie o calendário de eventos:

**Criar Evento:**
1. Defina título e descrição
2. Escolha data e hora de início
3. Defina hora de término (opcional)
4. Selecione o tipo de evento
5. Marque como público ou privado

**Tipos de Eventos:**
- Aula ao vivo
- Prazo de entrega
- Seminário
- Reunião

**Eventos Públicos:**
- Visíveis para todos os alunos
- Aparecem no calendário do dashboard`,
  },
  {
    id: "devotionals",
    icon: FileText,
    title: "Devocionais",
    content: `Gerencie devocionais diários:

**Criar Devocional:**
1. Defina título e data de publicação
2. Adicione referência bíblica
3. Escreva o texto do versículo
4. Desenvolva a reflexão
5. Adicione oração (opcional)

**Agendamento:**
- Defina a data em que o devocional aparecerá
- Programe com antecedência

**Dica:** Prepare devocionais para datas especiais (Páscoa, Natal, etc.)`,
  },
  {
    id: "blog",
    icon: Newspaper,
    title: "Blog (com IA)",
    content: `Crie conteúdo para o blog com ajuda da IA:

**Geração com IA:**
1. Abra a tela de criação de post
2. Digite um tema (opcional)
3. Adicione referência bíblica (opcional)
4. Clique em "Gerar com IA"
5. A IA criará título, resumo e conteúdo

**Edição:**
- Revise e edite o conteúdo gerado
- Ajuste o texto conforme necessário
- Adicione nome do autor

**Publicação:**
- Marque "Publicar imediatamente" para disponibilizar
- Posts não publicados ficam como rascunho

**Onde Aparece:**
- Página de Blog do aluno
- Posts recentes no dashboard`,
  },
  {
    id: "messages",
    icon: MessageSquare,
    title: "Mensagens",
    content: `Sistema de comunicação interno:

**Enviar Mensagem:**
1. Clique em "Nova Mensagem"
2. Selecione o destinatário
3. Escreva o assunto
4. Desenvolva o conteúdo
5. Envie

**Gerenciamento:**
- Visualize mensagens enviadas e recebidas
- Filtre por status (lida/não lida)
- Exclua mensagens antigas

**Dica:** Use mensagens para comunicar avisos importantes aos alunos.`,
  },
  {
    id: "strongs",
    icon: Languages,
    title: "Dicionário Strong's",
    content: `Traduza termos do dicionário Strong's:

**Tradução Automática:**
- Sistema usa IA para traduzir termos
- Gera definição em português
- Inclui uso contextual

**Tradução Manual:**
- Edite traduções existentes
- Corrija termos quando necessário

**Visualização:**
- Veja termos já traduzidos
- Filtre por status de tradução`,
  },
  {
    id: "materials",
    icon: Download,
    title: "Materiais PDF",
    content: `Gerencie materiais para download:

**Upload de Arquivos:**
1. Clique em "Novo Material"
2. Faça upload do arquivo PDF
3. Adicione título e descrição
4. Vincule a um curso (opcional)

**Estatísticas:**
- Veja contagem de downloads
- Identifique materiais populares

**Organização:**
- Categorize por tipo
- Agrupe por curso`,
  },
  {
    id: "reports",
    icon: BarChart3,
    title: "Relatórios",
    content: `Visualize estatísticas detalhadas:

**Relatórios Disponíveis:**
- Matrículas por período
- Progresso dos alunos
- Cursos mais populares
- Certificados emitidos

**Exportação:**
- Exporte dados para Excel/CSV
- Gere relatórios em PDF

**Dica:** Use relatórios para identificar pontos de melhoria.`,
  },
  {
    id: "settings",
    icon: Settings,
    title: "Configurações",
    content: `Configure o sistema:

**Configurações Gerais:**
- Nome da instituição
- Logo e identidade visual
- Informações de contato

**Configurações de Email:**
- Modelo de emails automáticos
- Notificações

**Backup:**
- Exporte dados do sistema
- Restaure configurações

**Dica:** Faça backup regularmente para segurança.`,
  },
];

export default function AdminManualPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Manual do Administrador</h1>
            <p className="text-muted-foreground">
              Guia completo de todas as funcionalidades do painel administrativo
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Índice do Manual</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {manualSections.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <section.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{section.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-12 pr-4 py-2">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {section.content.split("\n\n").map((paragraph, idx) => {
                          if (paragraph.startsWith("**") && paragraph.includes(":**")) {
                            const [title, ...rest] = paragraph.split(":**");
                            return (
                              <div key={idx} className="mb-3">
                                <h4 className="font-semibold text-foreground mb-1">
                                  {title.replace(/\*\*/g, "")}:
                                </h4>
                                <p className="text-muted-foreground">
                                  {rest.join(":**").replace(/\*\*/g, "")}
                                </p>
                              </div>
                            );
                          }
                          if (paragraph.startsWith("- ") || paragraph.match(/^\d\./)) {
                            const items = paragraph.split("\n");
                            return (
                              <ul key={idx} className="list-disc list-inside mb-3 text-muted-foreground space-y-1">
                                {items.map((item, itemIdx) => (
                                  <li key={itemIdx}>
                                    {item.replace(/^[-\d.]\s*/, "").replace(/\*\*/g, "")}
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          return (
                            <p key={idx} className="text-muted-foreground mb-3">
                              {paragraph.replace(/\*\*/g, "")}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Precisa de mais ajuda?</h3>
                <p className="text-muted-foreground">
                  Se você tiver dúvidas adicionais sobre o funcionamento do sistema,
                  entre em contato com o suporte técnico ou consulte a documentação
                  completa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
