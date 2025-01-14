'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Pencil } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const { messages, setMessages, currentConversation, setCurrentConversation } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 加载对话信息
  useEffect(() => {
    async function loadConversation() {
      if (!params.id) return;

      try {
        // 获取对话信息
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', params.id)
          .single();

        if (convError) throw convError;
        setCurrentConversation(conversation);

        // 获取消息列表
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', params.id)
          .order('created_at', { ascending: true });

        if (msgError) throw msgError;
        setMessages(messages || []);
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    }

    loadConversation();
  }, [params.id, setCurrentConversation, setMessages, supabase]);

  // 当进入编辑模式时自动聚焦输入框
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  // 开始编辑标题
  const handleEditTitle = () => {
    setTitleInput(currentConversation.title);
    setIsEditingTitle(true);
  };

  // 保存标题
  const handleSaveTitle = async () => {
    if (!titleInput.trim() || titleInput === currentConversation.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: titleInput.trim() })
        .eq('id', currentConversation.id);

      if (error) throw error;

      setCurrentConversation({
        ...currentConversation,
        title: titleInput.trim()
      });
    } catch (error) {
      console.error('Error updating title:', error);
      alert('更新标题失败，请重试');
    } finally {
      setIsEditingTitle(false);
    }
  };

  // 处理标题输入框的按键事件
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentConversation || isLoading) return;

    setIsLoading(true);
    try {
      // 保存用户消息
      const { error: msgError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: currentConversation.id,
          content: input.trim(),
          role: 'user'
        }]);

      if (msgError) throw msgError;

      // 获取 AI 响应
      const response = await fetch('/api/bedrock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input.trim(),
          conversationId: currentConversation.id
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();

      // 保存 AI 响应
      const { error: aiError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: currentConversation.id,
          content: data.response,
          role: 'assistant'
        }]);

      if (aiError) throw aiError;

      // 重新加载消息
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversation.id)
        .order('created_at', { ascending: true });

      setMessages(messages || []);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('发送消息失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentConversation) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 标题栏 - 添加编辑功能 */}
      <div className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleTitleKeyDown}
                className="text-lg font-medium text-gray-800 bg-transparent border-b border-indigo-500 focus:outline-none w-full"
                placeholder="输入标题..."
              />
            ) : (
              <>
                <h1 className="text-lg font-medium text-gray-800">
                  {currentConversation.title}
                </h1>
                <button
                  onClick={handleEditTitle}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <Pencil size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 消息列表区域 - 设置固定高度 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4">
          <div className="py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 输入框区域 - 固定在底部 */}
      <div className="border-t bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入消息..."
              className="w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
              >
                {isLoading ? '发送中...' : '发送'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 