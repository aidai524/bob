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

interface AppContextType {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  currentConversation: Conversation | null;
  setCurrentConversation: (conversation: Conversation | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AppContext.Provider
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
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 