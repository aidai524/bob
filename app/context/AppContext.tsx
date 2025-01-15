'use client';

import { createContext, useContext, useState } from 'react';
import { Message, Conversation } from '@/app/types';

interface AppContextType {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  currentConversation: Conversation | null;
  setCurrentConversation: (conversation: Conversation | null) => void;
  pendingMessage: string | null;
  setPendingMessage: (message: string | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        messages,
        setMessages,
        currentConversation,
        setCurrentConversation,
        pendingMessage,
        setPendingMessage,
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