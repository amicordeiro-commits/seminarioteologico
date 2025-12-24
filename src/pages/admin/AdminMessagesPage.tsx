import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Search, Loader2, Mail, MailOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string | null;
  content: string;
  is_read: boolean | null;
  created_at: string | null;
  sender?: { full_name: string | null; avatar_url: string | null };
  receiver?: { full_name: string | null; avatar_url: string | null };
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function AdminMessagesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Fetch all profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles-for-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url");

      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch all messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-all-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
  });

  // Get profile by ID
  const getProfile = (id: string) => profiles.find((p) => p.id === id);

  // Get unique conversations (pair of users)
  const getConversations = () => {
    const conversationMap = new Map<string, { 
      key: string;
      user1: Profile | undefined;
      user2: Profile | undefined;
      lastMessage: Message;
      unreadCount: number;
      messageCount: number;
    }>();

    messages.forEach((msg) => {
      const key = [msg.sender_id, msg.receiver_id].sort().join("-");
      const existing = conversationMap.get(key);
      
      if (!existing || new Date(msg.created_at!) > new Date(existing.lastMessage.created_at!)) {
        conversationMap.set(key, {
          key,
          user1: getProfile(msg.sender_id),
          user2: getProfile(msg.receiver_id),
          lastMessage: msg,
          unreadCount: messages.filter((m) => 
            [m.sender_id, m.receiver_id].sort().join("-") === key && !m.is_read
          ).length,
          messageCount: messages.filter((m) => 
            [m.sender_id, m.receiver_id].sort().join("-") === key
          ).length,
        });
      }
    });

    return Array.from(conversationMap.values());
  };

  const conversations = getConversations();

  // Get messages for selected conversation
  const selectedMessages = selectedConversation
    ? messages.filter((m) => 
        [m.sender_id, m.receiver_id].sort().join("-") === selectedConversation
      ).sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())
    : [];

  const filteredConversations = conversations.filter((c) => {
    const searchLower = search.toLowerCase();
    return (
      c.user1?.full_name?.toLowerCase().includes(searchLower) ||
      c.user2?.full_name?.toLowerCase().includes(searchLower) ||
      c.lastMessage.subject?.toLowerCase().includes(searchLower) ||
      c.lastMessage.content.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 h-[calc(100vh-2rem)]">
        <div className="flex flex-col h-full space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              Gerenciar Mensagens
            </h1>
            <p className="text-muted-foreground mt-1">
              {messages.length} mensagens • {conversations.length} conversas
            </p>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex gap-6 min-h-0">
            {/* Conversations List */}
            <Card className="w-96 flex flex-col">
              <CardHeader className="pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="px-4 pb-4 space-y-2">
                      {filteredConversations.map((conv) => (
                        <button
                          key={conv.key}
                          onClick={() => setSelectedConversation(conv.key)}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            selectedConversation === conv.key
                              ? "bg-primary/10 border border-primary/30"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex -space-x-2">
                              <Avatar className="w-8 h-8 border-2 border-background">
                                <AvatarImage src={conv.user1?.avatar_url || ""} />
                                <AvatarFallback className="text-xs">
                                  {conv.user1?.full_name?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <Avatar className="w-8 h-8 border-2 border-background">
                                <AvatarImage src={conv.user2?.avatar_url || ""} />
                                <AvatarFallback className="text-xs">
                                  {conv.user2?.full_name?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm truncate">
                                  {conv.user1?.full_name || "Usuário"} ↔ {conv.user2?.full_name || "Usuário"}
                                </span>
                                {conv.unreadCount > 0 && (
                                  <Badge variant="default" className="ml-2 text-xs">
                                    {conv.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {conv.lastMessage.content}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {conv.messageCount} mensagens
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {conv.lastMessage.created_at && 
                                    format(new Date(conv.lastMessage.created_at), "dd/MM HH:mm", { locale: ptBR })
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                      {filteredConversations.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          Nenhuma conversa encontrada
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Messages View */}
            <Card className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg">
                      Conversa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-4">
                        {selectedMessages.map((msg) => {
                          const sender = getProfile(msg.sender_id);
                          return (
                            <div key={msg.id} className="flex gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={sender?.avatar_url || ""} />
                                <AvatarFallback className="text-xs">
                                  {sender?.full_name?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {sender?.full_name || "Usuário"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {msg.created_at && 
                                      format(new Date(msg.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                    }
                                  </span>
                                  {msg.is_read ? (
                                    <MailOpen className="w-3 h-3 text-muted-foreground" />
                                  ) : (
                                    <Mail className="w-3 h-3 text-primary" />
                                  )}
                                </div>
                                {msg.subject && (
                                  <p className="text-sm font-medium text-foreground mt-1">
                                    {msg.subject}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground mt-1">
                                  {msg.content}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Selecione uma conversa para visualizar</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
