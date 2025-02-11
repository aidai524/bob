'use client';

import { createContext, useContext, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  conversation_id: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

interface ChatContextType {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  currentConversation: Conversation | null;
  setCurrentConversation: (conversation: Conversation | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        conversations,
        setConversations,
        currentConversation,
        setCurrentConversation,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 