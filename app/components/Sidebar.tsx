'use client';

import { Home, Plus, User, HelpCircle, History } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useApp } from '@/app/context/AppContext';
import { useAuth } from '@/app/context/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { setCurrentConversation } = useApp();
  const { user } = useAuth();

  const isActive = (path: string) => pathname === path;

  const createNewChat = async () => {
    try {
      if (!user) return;

      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert([
          { user_id: user.id, title: '新对话' }
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentConversation(conversation);
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      console.error('Error creating new chat:', error);
      alert('创建对话失败，请重试');
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-24 bg-white border-r flex flex-col items-center py-8">
      <Link
        href="/"
        className={`p-3 rounded-lg border-2 transition-colors hover:border-indigo-500 hover:text-indigo-500 ${
          isActive('/') ? 'border-indigo-500 text-indigo-500' : 'border-gray-200 text-gray-500'
        }`}
      >
        <Home size={20} />
      </Link>

      <button
        onClick={createNewChat}
        className="p-3 rounded-lg border-2 border-gray-200 text-gray-500 transition-colors hover:border-indigo-500 hover:text-indigo-500"
      >
        <Plus size={20} />
      </button>

      <Link
        href="/profile"
        className={`p-3 rounded-lg border-2 transition-colors hover:border-indigo-500 hover:text-indigo-500 ${
          isActive('/profile') ? 'border-indigo-500 text-indigo-500' : 'border-gray-200 text-gray-500'
        }`}
      >
        <User size={20} />
      </Link>

      <Link
        href="/help"
        className="p-3 rounded-lg border-2 border-gray-200 text-gray-500 transition-colors hover:border-indigo-500 hover:text-indigo-500"
      >
        <HelpCircle size={20} />
      </Link>

      <Link
        href="/history"
        className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
        title="历史会话"
      >
        <History size={24} />
      </Link>
    </div>
  );
} 