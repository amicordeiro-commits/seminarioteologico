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
  DollarSign,
  MessagesSquare,
  UserPlus,
  Share2,
  BookMarked,
  ScrollText,
  Database,
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
- Matrículas realizadas
- Certificados emitidos
- Eventos programados
- Materiais na biblioteca

**Gráficos:**
- Matrículas mensais (últimos 6 meses)
- Distribuição de cursos por categoria

**Atividades Recentes:**
- Novas matrículas
- Certificados emitidos recentemente
- Ações rápidas para funcionalidades comuns

**Metas do Sistema:**
- Acompanhe o progresso em relação às metas definidas

**Dica:** Use o dashboard diariamente para monitorar a saúde do sistema e identificar tendências.`,
  },
  {
    id: "users",
    icon: Users,
    title: "Gerenciamento de Usuários",
    content: `Controle completo sobre os usuários do sistema:

**Listagem de Usuários:**
- Visualize todos os usuários cadastrados
- Filtre por nome, email ou tipo de curso
- Veja data de cadastro e avatar

**Ações Disponíveis:**
- Editar informações do perfil
- Alterar papéis (Admin, Instrutor, Aluno)
- Visualizar histórico acadêmico

**Papéis do Sistema:**
- **Admin:** Acesso total a todas as funcionalidades administrativas
- **Instrutor:** Pode gerenciar cursos, aulas e conteúdos
- **Aluno:** Acesso às áreas de aprendizado e biblioteca

**Segurança:**
- Papéis são armazenados em tabela separada por segurança
- Alterações de papel são registradas automaticamente`,
  },
  {
    id: "admissions",
    icon: UserPlus,
    title: "Admissões (Leads)",
    content: `Gerencie candidatos interessados no seminário:

**Cadastro de Leads:**
- Nome completo e email
- Telefone e localização (cidade/estado)
- Curso de interesse
- Como conheceu o seminário

**Status dos Leads:**
- **Novo:** Lead recém-cadastrado
- **Contato feito:** Primeiro contato realizado
- **Interessado:** Demonstrou interesse real
- **Matriculado:** Converteu em aluno
- **Não interessado:** Descartou a oportunidade

**Gestão:**
- Atribua leads a responsáveis
- Registre notas de acompanhamento
- Acompanhe data do último contato

**Dica:** Faça follow-up regular com leads "interessados" para aumentar conversões.`,
  },
  {
    id: "enrollments",
    icon: GraduationCap,
    title: "Matrículas",
    content: `Gerencie as matrículas dos alunos nos cursos:

**Visualização:**
- Lista completa de matrículas
- Progresso de cada aluno (%)
- Data de matrícula e conclusão

**Ações:**
- Matricular novos alunos em cursos
- Remover matrículas
- Acompanhar progresso detalhado

**Progresso:**
- Calculado automaticamente com base nas aulas completadas
- Quando atinge 100%, certificado pode ser emitido

**Dica:** Monitore alunos com baixo progresso para oferecer suporte proativo.`,
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
4. Defina nível (Iniciante, Intermediário, Avançado)
5. Adicione imagem de capa (thumbnail)
6. Marque como publicado quando pronto

**Editar Cursos:**
- Altere qualquer informação do curso
- Adicione ou remova aulas
- Publique/despublique cursos

**Categorias Disponíveis:**
- Teologia Sistemática
- Estudos Bíblicos
- História da Igreja
- Grego Bíblico
- Hebraico Bíblico
- Aconselhamento Pastoral
- Homilética

**Dica:** Cursos não publicados ficam invisíveis para alunos.`,
  },
  {
    id: "lessons",
    icon: PlayCircle,
    title: "Aulas",
    content: `Gerencie o conteúdo das aulas de cada curso:

**Criar Aula:**
1. Selecione o curso
2. Defina título e descrição
3. Adicione URL do vídeo (YouTube, Vimeo, etc.)
4. Escreva o conteúdo textual (suporta formatação)
5. Defina a ordem da aula no curso

**Campos Importantes:**
- **Vídeo URL:** Link do vídeo da aula
- **Duração:** Tempo estimado em minutos
- **Gratuita:** Marque para aulas de demonstração/preview
- **Ordem:** Define a sequência das aulas

**Conteúdo Rico:**
- O editor suporta texto formatado
- Adicione links e referências bíblicas

**Dica:** Aulas marcadas como "gratuitas" podem ser acessadas sem matrícula.`,
  },
  {
    id: "quizzes",
    icon: ClipboardList,
    title: "Quizzes (Avaliações)",
    content: `Crie avaliações para medir o aprendizado:

**Criar Quiz:**
1. Selecione o curso associado
2. Vincule a uma aula específica (opcional)
3. Defina título e descrição
4. Configure nota mínima para aprovação (%)
5. Defina tempo limite em minutos (opcional)

**Adicionar Perguntas:**
1. Abra o quiz criado
2. Clique em "Adicionar Pergunta"
3. Escreva a pergunta
4. Adicione 4 opções de resposta
5. Marque a resposta correta
6. Defina pontos da questão

**Publicação:**
- Marque o quiz como publicado quando pronto
- Alunos só verão quizzes publicados
- Resultados são salvos automaticamente

**Estatísticas:**
- Veja tentativas e notas dos alunos
- Identifique questões mais difíceis`,
  },
  {
    id: "certificates",
    icon: Award,
    title: "Certificados",
    content: `Gerencie certificados de conclusão:

**Emissão:**
- Emita certificados para alunos que completaram cursos
- Cada certificado tem número único para validação

**Visualização:**
- Veja todos os certificados emitidos
- Filtre por curso ou aluno
- Visualize data de emissão

**Download em PDF:**
- Baixe certificados em alta qualidade
- Escolha entre 4 estilos:
  - **Dourado:** Elegante e formal
  - **Azul:** Moderno e profissional
  - **Verde:** Acadêmico tradicional
  - **Vinho:** Sofisticado e distinto

**Validação:**
- Certificados podem ser verificados pelo número
- Sistema mantém registro permanente

**Dica:** O PDF gerado pode ser impresso em tamanho A4.`,
  },
  {
    id: "transcripts",
    icon: ScrollText,
    title: "Histórico Acadêmico",
    content: `Gerencie registros acadêmicos completos:

**Registros Acadêmicos:**
- Cursos matriculados e status
- Notas e avaliações
- Datas de início e conclusão
- Certificados vinculados

**Status dos Registros:**
- **Em andamento:** Aluno cursando
- **Concluído:** Curso finalizado
- **Pendente:** Aguardando ação

**Exportação:**
- Gere históricos em PDF para alunos
- Inclui todos os cursos e notas

**Dica:** Mantenha os registros atualizados para emissão correta de certificados.`,
  },
  {
    id: "library",
    icon: Library,
    title: "Biblioteca",
    content: `Gerencie materiais de apoio ao estudo:

**Tipos de Materiais:**
- PDFs e documentos
- Artigos e textos
- Sermões e estudos
- Comentários bíblicos

**Adicionar Material:**
1. Clique em "Novo Material"
2. Preencha título e descrição
3. Selecione a categoria
4. Faça upload do arquivo ou cole o conteúdo
5. Vincule a um curso (opcional)
6. Publique quando pronto

**Categorias:**
- Sermões
- Estudos Bíblicos
- Comentários
- Artigos Acadêmicos
- Material Didático

**Estatísticas:**
- Contagem de downloads por material
- Materiais mais populares`,
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
5. Vincule a um curso (opcional)
6. Marque como público ou privado

**Tipos de Eventos:**
- **Aula:** Aula ao vivo ou presencial
- **Prazo:** Data limite para entregas
- **Seminário:** Evento especial
- **Reunião:** Encontros administrativos

**Visibilidade:**
- Eventos públicos aparecem para todos os alunos
- Eventos privados só para administradores

**Dica:** Use eventos para avisar sobre prazos importantes.`,
  },
  {
    id: "devotionals",
    icon: FileText,
    title: "Devocionais",
    content: `Gerencie devocionais diários para os alunos:

**Criar Devocional:**
1. Defina título inspirador
2. Escolha a data de publicação
3. Adicione referência bíblica
4. Escreva o texto do versículo
5. Desenvolva a reflexão
6. Adicione oração de encerramento

**Agendamento:**
- Defina a data em que o devocional aparecerá
- Programe devocionais com antecedência
- Apenas um devocional por dia é exibido

**Geração com IA:**
- Use a IA para gerar devocionais automaticamente
- Defina tema ou referência bíblica
- Revise e edite o conteúdo gerado

**Dica:** Prepare devocionais especiais para datas comemorativas.`,
  },
  {
    id: "blog",
    icon: Newspaper,
    title: "Blog (com IA e Compartilhamento)",
    content: `Crie e compartilhe conteúdo para o blog:

**Geração com IA:**
1. Abra a tela de criação de post
2. Digite um tema (opcional)
3. Adicione referência bíblica (opcional)
4. Clique em "Gerar com IA"
5. A IA criará título, resumo e conteúdo completo

**Edição:**
- Revise e edite o conteúdo gerado
- Ajuste o texto conforme necessário
- Adicione nome do autor
- Faça upload de imagem de capa

**Imagem de Capa:**
- Faça upload de imagens até 2MB
- Imagens são otimizadas automaticamente
- Aparecem no compartilhamento social

**Publicação:**
- Marque "Publicar imediatamente" para disponibilizar
- Posts não publicados ficam como rascunho

**Compartilhamento no Facebook:**
- Posts incluem Open Graph tags otimizadas
- Use o botão "Compartilhar no Facebook" na página do post
- Imagens e títulos aparecem corretamente no Facebook
- Link especial com preview otimizado

**Dica:** Sempre adicione imagem de capa para melhor engajamento nas redes sociais.`,
  },
  {
    id: "forum",
    icon: MessagesSquare,
    title: "Fórum da Comunidade",
    content: `Gerencie discussões da comunidade:

**Tópicos:**
- Visualize todos os tópicos criados
- Veja contagem de respostas e visualizações
- Filtre por curso ou data

**Moderação:**
- Fixe tópicos importantes (pin)
- Trave tópicos para impedir novas respostas (lock)
- Exclua tópicos inadequados
- Marque respostas como solução

**Vinculação:**
- Tópicos podem ser vinculados a cursos
- Ou a aulas específicas
- Facilita discussões contextualizadas

**Estatísticas:**
- Tópicos mais ativos
- Usuários mais participativos
- Respostas por período

**Dica:** Incentive discussões respondendo aos primeiros tópicos.`,
  },
  {
    id: "messages",
    icon: MessageSquare,
    title: "Mensagens",
    content: `Sistema de comunicação interna:

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

**Mensagens em Massa:**
- Envie comunicados para múltiplos alunos
- Ideal para avisos gerais

**Dica:** Use mensagens para comunicar avisos importantes e manter contato pessoal com alunos.`,
  },
  {
    id: "financial",
    icon: DollarSign,
    title: "Financeiro",
    content: `Gerencie finanças e pagamentos:

**Transações:**
- Visualize todas as transações financeiras
- Filtre por status (pendente, pago, atrasado)
- Veja histórico de pagamentos por aluno

**Planos de Curso:**
- Crie planos de pagamento para cursos
- Defina valores e número de parcelas
- Ative/desative planos

**Doações:**
- Acompanhe doações recebidas
- Veja doadores e valores
- Identifique doações recorrentes

**Status de Transações:**
- **Pendente:** Aguardando pagamento
- **Pago:** Pagamento confirmado
- **Atrasado:** Vencido e não pago
- **Cancelado:** Transação cancelada

**Relatórios:**
- Receita por período
- Inadimplência
- Projeções financeiras

**Dica:** Acompanhe transações atrasadas para realizar cobranças.`,
  },
  {
    id: "strongs",
    icon: Languages,
    title: "Dicionário Strong's",
    content: `Gerencie traduções do dicionário Strong's:

**Tradução Automática com IA:**
- Sistema usa IA para traduzir termos hebraicos/gregos
- Gera definição completa em português
- Inclui uso contextual na Bíblia

**Edição Manual:**
- Revise e edite traduções existentes
- Corrija termos quando necessário
- Adicione informações adicionais

**Campos Traduzidos:**
- Palavra em português
- Definição completa
- Transliteração
- Parte do discurso (substantivo, verbo, etc.)
- Uso contextual

**Visualização na Bíblia:**
- Alunos podem clicar em números Strong's
- Veem tradução em popup ou painel lateral

**Dica:** Priorize a tradução de termos mais usados nas passagens estudadas.`,
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
4. Selecione categoria
5. Vincule a um curso (opcional)

**Armazenamento:**
- Arquivos são salvos no storage seguro
- URLs são permanentes e protegidas
- Suporte a múltiplos formatos

**Estatísticas:**
- Contagem de downloads por material
- Materiais mais populares
- Downloads por período

**Organização:**
- Categorize por tipo
- Agrupe por curso
- Filtre por data

**Dica:** Nomeie arquivos de forma descritiva para facilitar buscas.`,
  },
  {
    id: "reports",
    icon: BarChart3,
    title: "Relatórios",
    content: `Visualize estatísticas detalhadas do sistema:

**Relatórios Disponíveis:**
- Matrículas por período
- Progresso dos alunos
- Cursos mais populares
- Certificados emitidos
- Receita financeira

**Métricas Importantes:**
- Taxa de conclusão de cursos
- Tempo médio para conclusão
- Alunos ativos vs inativos
- Quizzes: média de notas

**Exportação:**
- Exporte dados para análise externa
- Gere relatórios em PDF

**Dica:** Analise relatórios mensalmente para identificar tendências e oportunidades.`,
  },
  {
    id: "backups",
    icon: Database,
    title: "Backup e Restauração",
    content: `Gerencie backups completos do sistema:

**Criar Backup:**
1. Acesse Admin → Backup
2. Clique em "Criar Backup"
3. Adicione notas descritivas (opcional)
4. Aguarde a conclusão do processo
5. O backup será salvo automaticamente

**Dados Incluídos no Backup:**
- Usuários e perfis
- Cursos e aulas
- Matrículas e progresso
- Quizzes e tentativas
- Certificados emitidos
- Biblioteca e materiais
- Blog e devocionais
- Fórum e mensagens
- Transações financeiras
- Configurações

**Restaurar Backup:**
1. Selecione o backup desejado na lista
2. Clique no botão de restauração (ícone upload)
3. Escolha se deseja limpar dados existentes
4. Confirme a operação
5. Aguarde a restauração completa

**Download de Backup:**
- Baixe backups em formato JSON
- Guarde cópias externas para segurança adicional

**Boas Práticas:**
- Crie backups regulares (semanal ou antes de atualizações)
- Mantenha pelo menos 3 backups recentes
- Teste a restauração periodicamente
- Documente o conteúdo de cada backup nas notas

**Atenção:**
- A restauração sobrescreve dados existentes
- Sempre crie um backup atual antes de restaurar
- O processo pode levar alguns minutos dependendo do volume de dados

**Dica:** Crie um backup antes de qualquer alteração significativa no sistema.`,
  },
  {
    id: "settings",
    icon: Settings,
    title: "Configurações",
    content: `Configure o sistema do seminário:

**Configurações Gerais:**
- Nome da instituição
- Logo e identidade visual
- Informações de contato
- Redes sociais

**Configurações de Email:**
- Modelos de emails automáticos
- Notificações de sistema
- Emails de boas-vindas

**Configurações de Cursos:**
- Categorias disponíveis
- Níveis de dificuldade
- Requisitos de conclusão

**Segurança:**
- Políticas de senha
- Tempo de sessão
- Logs de acesso

**Dica:** Revise configurações periodicamente para manter o sistema otimizado.`,
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
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5" />
              Índice do Manual ({manualSections.length} seções)
            </CardTitle>
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
                                <p className="text-muted-foreground whitespace-pre-line">
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
                  entre em contato com o suporte técnico. Este manual é atualizado
                  regularmente com novas funcionalidades.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Versão 2.0
                  </span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                    Última atualização: Dezembro 2024
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
