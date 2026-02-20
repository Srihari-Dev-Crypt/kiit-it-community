import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Msg = { role: "user" | "assistant"; content: string };

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useChatHistory() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) setConversations(data);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    setLoadingHistory(true);
    supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setMessages(data.map((m) => ({ role: m.role as Msg["role"], content: m.content })));
        }
        setLoadingHistory(false);
      });
  }, [activeConversationId]);

  // Create a new conversation
  const createConversation = useCallback(
    async (firstMessage: string): Promise<string | null> => {
      if (!user) return null;
      const title = firstMessage.slice(0, 60) + (firstMessage.length > 60 ? "…" : "");
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({ user_id: user.id, title })
        .select("id")
        .single();
      if (error || !data) return null;
      setActiveConversationId(data.id);
      await loadConversations();
      return data.id;
    },
    [user, loadConversations]
  );

  // Save a message to the database
  const saveMessage = useCallback(
    async (conversationId: string, role: Msg["role"], content: string) => {
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role,
        content,
      });
      // Update conversation's updated_at
      await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    },
    []
  );

  // Delete a conversation
  const deleteConversation = useCallback(
    async (id: string) => {
      await supabase.from("chat_conversations").delete().eq("id", id);
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
      await loadConversations();
    },
    [activeConversationId, loadConversations]
  );

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    setMessages,
    loadingHistory,
    createConversation,
    saveMessage,
    deleteConversation,
    startNewChat,
  };
}
