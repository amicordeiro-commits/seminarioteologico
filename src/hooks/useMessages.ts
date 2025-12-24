import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export function useMessages(partnerId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["messages", partnerId, user?.id],
    queryFn: async () => {
      if (!user?.id || !partnerId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user?.id && !!partnerId,
  });
}

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all messages involving the user
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get unique partners
      const partnerIds = new Set<string>();
      messages.forEach((m: Message) => {
        if (m.sender_id === user.id) {
          partnerIds.add(m.receiver_id);
        } else {
          partnerIds.add(m.sender_id);
        }
      });

      // Get partner profiles
      if (partnerIds.size === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", Array.from(partnerIds));

      if (profilesError) throw profilesError;

      // Build conversation list
      const conversations: Conversation[] = [];
      
      partnerIds.forEach((partnerId) => {
        const partnerMessages = messages.filter(
          (m: Message) => m.sender_id === partnerId || m.receiver_id === partnerId
        );
        
        const lastMessage = partnerMessages[0];
        const unreadCount = partnerMessages.filter(
          (m: Message) => m.receiver_id === user.id && !m.is_read
        ).length;
        
        const profile = profiles?.find((p: any) => p.id === partnerId);

        conversations.push({
          partnerId,
          partnerName: profile?.full_name || "Usuário",
          partnerAvatar: profile?.avatar_url,
          lastMessage: lastMessage?.content || "",
          lastMessageTime: lastMessage?.created_at || "",
          unreadCount,
        });
      });

      return conversations;
    },
    enabled: !!user?.id,
  });
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      receiverId,
      content,
      subject,
    }: {
      receiverId: string;
      content: string;
      subject?: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          subject,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.receiverId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageIds: string[]) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", messageIds)
        .eq("receiver_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useRealtimeMessages(partnerId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id || !partnerId) return;

    const channel = supabase
      .channel(`messages-${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (
            (newMessage.sender_id === user.id && newMessage.receiver_id === partnerId) ||
            (newMessage.sender_id === partnerId && newMessage.receiver_id === user.id)
          ) {
            queryClient.invalidateQueries({ queryKey: ["messages", partnerId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, partnerId, queryClient]);
}
