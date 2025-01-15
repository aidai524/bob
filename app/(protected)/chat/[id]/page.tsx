'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Pencil, Send } from 'lucide-react';
import { Navigation } from '@/app/components/Navigation';
import { BotAvatar } from '@/app/components/BotAvatar';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import { Message } from '@/app/types';

// Dynamic chat page component
export default function ChatPage() {
  const params = useParams();
  const { messages, setMessages, currentConversation, setCurrentConversation, pendingMessage, setPendingMessage } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { user, profile } = useAuth();

  // 添加调试日志
  useEffect(() => {
    console.log('User data:', user);
  }, [user]);

  // 加载对话信息
  useEffect(() => {
    async function loadConversation() {
      // 如果是新对话，不需要加载现有对话
      if (params.id === 'new') return;

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

    // 清理之前的状态
    if (params.id === 'new') {
      setCurrentConversation(null);
      setMessages([]);
    } else {
      loadConversation();
    }
  }, [params.id, setCurrentConversation, setMessages, supabase]);

  // 当进入编辑模式时自动聚焦输入框
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  // 开始编辑标题
  const handleEditTitle = () => {
    if (!currentConversation) return;
    setTitleInput(currentConversation.title);
    setIsEditingTitle(true);
  };

  // 保存标题
  const handleSaveTitle = async () => {
    if (!currentConversation || !titleInput.trim() || titleInput === currentConversation.title) {
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
      alert('Failed to update title, please try again');
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
    setError(null);

    try {
      // 1. 立即保存并显示用户消息
      const userMessage = {
        conversation_id: currentConversation.id,
        content: input.trim(),
        role: 'user' as const
      };

      // 保存到数据库
      const { error: msgError } = await supabase
        .from('messages')
        .insert([userMessage]);

      if (msgError) throw msgError;

      // 立即更新本地状态
      const newMessage: Message = {
        id: Date.now(),
        ...userMessage,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
      setInput('');

      // 2. 设置超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      // 3. 获取 AI 响应
      const response = await fetch('/api/bedrock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input.trim(),
          conversationId: currentConversation.id
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '发送消息失败，请重试');
      }

      const data = await response.json();

      // 4. 保存 AI 响应
      const { error: aiError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: currentConversation.id,
          content: data.response,
          role: 'assistant' as const
        }]);

      if (aiError) throw aiError;

      // 5. 更新消息列表
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversation.id)
        .order('created_at', { ascending: true });

      setMessages(messages || []);

    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.name === 'AbortError') {
        setError('请求超时，请重试');
      } else {
        setError(error.message || '发送消息失败，请重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 添加自动滚动函数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 当消息更新时自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理新对话初始化
  useEffect(() => {
    let isSubscribed = true;

    async function initializeNewChat() {
      if (params.id === 'new' && pendingMessage && isSubscribed) {
        setIsInitializing(true);
        try {
          // 1. 创建新对话
          const { data: { user } } = await supabase.auth.getUser();
          if (!user || !isSubscribed) return;

          const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .insert([
              { user_id: user.id, title: pendingMessage.slice(0, 50) }
            ])
            .select()
            .single();

          if (convError || !isSubscribed) throw convError;

          // 2. 创建用户消息并更新状态
          const userMessage = {
            conversation_id: conversation.id,
            content: pendingMessage,
            role: 'user'
          };

          const { error: msgError } = await supabase
            .from('messages')
            .insert([userMessage]);

          if (msgError || !isSubscribed) throw msgError;

          // 3. 更新状态
          setCurrentConversation(conversation);
          setMessages((prev: Message[]) => [...prev, {
            id: Date.now(),
            ...userMessage,
            created_at: new Date().toISOString()
          } as Message]);

          // 4. 更新 URL（不刷新页面）
          if (isSubscribed) {
            window.history.replaceState({}, '', `/chat/${conversation.id}`);
          }

          // 5. 获取 AI 响应
          const response = await fetch('/api/bedrock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: pendingMessage,
              conversationId: conversation.id
            }),
          });

          if (!response.ok || !isSubscribed) throw new Error('Failed to get AI response');
          const data = await response.json();

          // 6. 保存 AI 响应并更新本地状态
          const aiMessage = {
            conversation_id: conversation.id,
            content: data.response,
            role: 'assistant' as const
          };

          const { error: aiError } = await supabase
            .from('messages')
            .insert([aiMessage]);

          if (aiError || !isSubscribed) throw aiError;

          // 7. 直接更新本地状态，不重新加载
          if (isSubscribed) {
            setMessages((prev: Message[]) => [...prev, {
              id: Date.now() + 1,
              ...aiMessage,
              created_at: new Date().toISOString()
            } as Message]);
          }

        } catch (error) {
          console.error('Error initializing chat:', error);
          if (isSubscribed) {
            alert('创建对话失败，请重试');
          }
        } finally {
          if (isSubscribed) {
            setIsInitializing(false);
            setPendingMessage(null);
          }
        }
      }
    }

    initializeNewChat();

    return () => {
      isSubscribed = false;
    };
  }, [params.id, pendingMessage, setCurrentConversation, setMessages, setPendingMessage, supabase]);

  // 获取用户显示名称的首字母
  const getInitial = () => {
    if (profile?.username) {
      return profile.username[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  if (!currentConversation) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navigation />
      
      {/* 主要内容区域 */}
      <main className="flex flex-col h-screen">
        {/* 标题栏 */}
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
                  placeholder="Enter title..."
                />
              ) : (
                <>
                  <h1 className="text-lg font-medium text-gray-800">
                    {currentConversation?.title}
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

        {/* 消息列表区域 */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className="py-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* 头像 */}
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt="User Avatar"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-medium">
                          {getInitial()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <BotAvatar />
                  )}

                  {/* 消息内容 */}
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

              {/* 加载状态显示 */}
              {(isLoading || isInitializing) && (
                <div className="flex items-start gap-3">
                  <BotAvatar />
                  <div className="bg-gray-100 rounded-2xl px-6 py-3 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-gray-600">AI 正在思考</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* 输入框区域 - 固定在底部 */}
        <div className="border-t bg-white">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入消息... (按 Enter 发送，Shift + Enter 换行)"
                  className="w-full px-4 py-4 pr-32 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none"
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
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  title={isLoading ? '发送中...' : '发送'}
                >
                  <Send size={20} className={isLoading ? 'animate-pulse' : ''} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* 错误提示 */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50">
          <p className="flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      )}
    </div>
  );
} 