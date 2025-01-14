'use client';

import { useState } from 'react';
import { useConversation } from '@/app/context/ConversationContext';
import { Send } from 'lucide-react';

export function ChatInput() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentConversation, addMessage } = useConversation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentConversation || loading) return;

    try {
      setLoading(true);
      
      // 保存用户消息
      await addMessage(message, 'user');

      // 发送到 Bedrock
      const response = await fetch('/api/bedrock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      
      // 保存 AI 响应
      if (data.response) {
        await addMessage(data.response, 'assistant');
      }

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentConversation) return null;

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入消息..."
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !message.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send className="w-6 h-6" />
        )}
      </button>
    </form>
  );
} 