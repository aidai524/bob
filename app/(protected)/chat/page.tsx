'use client';

import { ConversationList } from '@/app/components/ConversationList';
import { MessageList } from '@/app/components/MessageList';
import { ChatInput } from '@/app/components/ChatInput';
import { ConversationProvider } from '@/app/context/ConversationContext';

export default function ChatPage() {
  return (
    <ConversationProvider>
      <div className="flex h-screen">
        {/* 侧边栏 */}
        <div className="w-64 border-r bg-gray-50">
          <ConversationList />
        </div>

        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col">
          <MessageList />
          <div className="border-t p-4">
            <ChatInput />
          </div>
        </div>
      </div>
    </ConversationProvider>
  );
} 