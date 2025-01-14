'use client';

import { ChatProvider } from './context/ChatContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>{children}</ChatProvider>
  );
} 