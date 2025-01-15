'use client';

import { useChat } from '@/app/context/ChatContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { UserCircle } from 'lucide-react';

export function MessageList() {
  const { messages, currentConversation } = useChat();

  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Waiting for AI response...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-4 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
          )}
          
          <div
            className={`flex flex-col max-w-[80%] ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {message.role === 'assistant' ? (
                <MarkdownRenderer content={message.content} />
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {new Date(message.created_at).toLocaleTimeString()}
            </span>
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <UserCircle className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 