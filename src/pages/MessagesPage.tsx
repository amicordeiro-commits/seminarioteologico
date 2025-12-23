import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, MoreVertical, Phone, Video, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const conversations = [
  {
    id: "1",
    name: "Maria Santos",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    lastMessage: "Olá! Você conseguiu resolver o exercício 3?",
    time: "5 min",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Suporte Técnico",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Support",
    lastMessage: "Sua dúvida foi respondida. Confira!",
    time: "1h",
    unread: 0,
    online: true,
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    lastMessage: "Obrigado pela explicação!",
    time: "2h",
    unread: 0,
    online: false,
  },
  {
    id: "4",
    name: "Grupo: React Avançado",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Group1",
    lastMessage: "Ana: Alguém pode ajudar com Context API?",
    time: "3h",
    unread: 5,
    online: false,
    isGroup: true,
  },
];

const messages = [
  {
    id: "1",
    sender: "Maria Santos",
    content: "Oi João! Tudo bem?",
    time: "10:30",
    isOwn: false,
  },
  {
    id: "2",
    sender: "Você",
    content: "Olá Maria! Tudo ótimo, e você?",
    time: "10:32",
    isOwn: true,
  },
  {
    id: "3",
    sender: "Maria Santos",
    content: "Estou bem! Você conseguiu resolver o exercício 3 do módulo de Hooks?",
    time: "10:33",
    isOwn: false,
  },
  {
    id: "4",
    sender: "Maria Santos",
    content: "Estou com uma dúvida sobre o useEffect com dependências",
    time: "10:33",
    isOwn: false,
  },
  {
    id: "5",
    sender: "Você",
    content: "Sim! Na verdade a chave é entender que o array de dependências controla quando o efeito é re-executado. Se você passa um array vazio, ele só roda na montagem.",
    time: "10:35",
    isOwn: true,
  },
];

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState("");

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] flex rounded-xl overflow-hidden border border-border bg-card">
        {/* Conversations List */}
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar conversas..." className="pl-10" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 hover:bg-secondary transition-colors text-left",
                  selectedConversation.id === conversation.id && "bg-secondary"
                )}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground truncate">{conversation.name}</p>
                    <span className="text-xs text-muted-foreground">{conversation.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unread > 0 && (
                  <Badge className="bg-accent text-accent-foreground">{conversation.unread}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedConversation.avatar} />
                <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{selectedConversation.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex", message.isOwn ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5",
                    message.isOwn
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1"
              />
              <Button size="icon">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MessagesPage;
