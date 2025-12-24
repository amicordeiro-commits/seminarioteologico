import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, MoreVertical, Paperclip, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useConversations, useMessages, useSendMessage, useMarkAsRead, useRealtimeMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

const MessagesPage = () => {
  const { user } = useAuth();
  const { data: conversations = [], isLoading: loadingConversations } = useConversations();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading: loadingMessages } = useMessages(selectedPartnerId || undefined);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  // Enable realtime for current conversation
  useRealtimeMessages(selectedPartnerId || undefined);

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedPartnerId) {
      setSelectedPartnerId(conversations[0].partnerId);
    }
  }, [conversations, selectedPartnerId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedPartnerId && messages.length > 0) {
      const unreadMessages = messages
        .filter((m) => m.receiver_id === user?.id && !m.is_read)
        .map((m) => m.id);
      
      if (unreadMessages.length > 0) {
        markAsRead.mutate(unreadMessages);
      }
    }
  }, [selectedPartnerId, messages, user?.id]);

  const selectedConversation = conversations.find((c) => c.partnerId === selectedPartnerId);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedPartnerId) return;

    try {
      await sendMessage.mutateAsync({
        receiverId: selectedPartnerId,
        content: messageText.trim(),
      });
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, "HH:mm", { locale: ptBR });
    }
    if (isYesterday(date)) {
      return `Ontem ${format(date, "HH:mm", { locale: ptBR })}`;
    }
    return format(date, "d MMM HH:mm", { locale: ptBR });
  };

  const formatConversationTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, "HH:mm", { locale: ptBR });
    }
    if (isYesterday(date)) {
      return "Ontem";
    }
    return format(date, "d MMM", { locale: ptBR });
  };

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
            {loadingConversations ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Nenhuma conversa</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.partnerId}
                  onClick={() => setSelectedPartnerId(conversation.partnerId)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 hover:bg-secondary transition-colors text-left",
                    selectedPartnerId === conversation.partnerId && "bg-secondary"
                  )}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={conversation.partnerAvatar || undefined} />
                      <AvatarFallback>{conversation.partnerName[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground truncate">{conversation.partnerName}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatConversationTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-accent text-accent-foreground">{conversation.unreadCount}</Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.partnerAvatar || undefined} />
                    <AvatarFallback>{selectedConversation.partnerName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{selectedConversation.partnerName}</p>
                    <p className="text-sm text-muted-foreground">Online</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma mensagem ainda</p>
                    <p className="text-xs">Envie a primeira mensagem!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2.5",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-secondary text-secondary-foreground rounded-bl-sm"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={cn(
                              "text-[10px] mt-1",
                              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}
                          >
                            {formatMessageTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
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
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleSend} disabled={!messageText.trim() || sendMessage.isPending}>
                    {sendMessage.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Selecione uma conversa</p>
                <p className="text-sm">Escolha uma conversa para começar a trocar mensagens</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MessagesPage;
