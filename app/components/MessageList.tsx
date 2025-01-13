'use client';

import { useChat } from '@/app/context/ChatContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { UserCircle, Bot } from 'lucide-react';

export function MessageList() {
  const { messages } = useChat();
  
  console.log('Current messages:', messages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        console.log('Rendering message:', message);
        return (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <Bot className="h-8 w-8 text-blue-500" />
              </div>
            )}
            
            <div
              className={`rounded-lg p-4 max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <MarkdownRenderer 
                content={typeof message.content === 'object' ? JSON.stringify(message.content, null, 2) : message.content}
              />
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <UserCircle className="h-8 w-8 text-blue-500" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 