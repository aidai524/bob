'use client';

import { HomeSidebar } from './components/HomeSidebar';
import { MessageCircle, Sparkles, Zap, Send } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const popularPrompts = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    text: "中本聪是谁"
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    text: "风吹上的阳坛布雨干什么用的"
  },
  {
    icon: <Zap className="w-5 h-5" />,
    text: "OpenAI现场生成模型Sora正式上线"
  }
];

export default function Home() {
  const [input, setInput] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      // 1. 创建新对话
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert([
          { user_id: user.id, title: input.slice(0, 50) }
        ])
        .select()
        .single();

      if (convError) throw convError;

      // 2. 创建第一条消息
      const { error: msgError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversation.id,
            content: input,
            role: 'user'
          }
        ]);

      if (msgError) throw msgError;

      // 3. 获取 AI 响应
      const response = await fetch('/api/bedrock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          conversationId: conversation.id
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();

      // 4. 保存 AI 响应
      const { error: aiError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversation.id,
          content: data.response,
          role: 'assistant'
        }]);

      if (aiError) throw aiError;

      // 5. 跳转到新对话
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('创建对话失败，请重试');
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <HomeSidebar />
      
      {/* 主要内容区域 */}
      <main className="ml-24 p-8">
        <div className="max-w-3xl mx-auto">
          {/* 对话框 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <form onSubmit={handleSubmit}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入你想问的任何问题..."
                className="w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none"
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
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                  disabled={!input.trim()}
                >
                  发送
                </button>
              </div>
            </form>
          </div>

          {/* 热门对话 */}
          <div className="space-y-3">
            {popularPrompts.map((prompt, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow hover:shadow-md transition-shadow text-left"
              >
                <div className="text-indigo-500">
                  {prompt.icon}
                </div>
                <span className="text-gray-700">{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
