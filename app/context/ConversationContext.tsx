'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import type { Conversation, Message } from '@/types/database';

interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  createConversation: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  addMessage: (content: string, role: 'user' | 'assistant') => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载用户的所有对话
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载特定对话的消息
  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // 创建新对话
  const createConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            user_id: user?.id,
            title: '新对话',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setConversations([data, ...conversations]);
      setCurrentConversation(data);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // 选择对话
  const selectConversation = async (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
      await loadMessages(id);
    }
  };

  // 添加消息
  const addMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!currentConversation) return;

    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: currentConversation.id,
            content,
            role,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMessages([...messages, message]);

      // 更新对话的更新时间
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversation.id);

      // 如果是第一条消息，更新对话标题
      if (messages.length === 0 && role === 'user') {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await supabase
          .from('conversations')
          .update({ title })
          .eq('id', currentConversation.id);

        setCurrentConversation({ ...currentConversation, title });
        setConversations(
          conversations.map(c =>
            c.id === currentConversation.id ? { ...c, title } : c
          )
        );
      }
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  // 删除对话
  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConversations(conversations.filter(c => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        createConversation,
        selectConversation,
        addMessage,
        deleteConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
} 