'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Search, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useChat } from '@/app/context/ChatContext';

export function ConversationList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { conversations, setConversations, currentConversation, setCurrentConversation } = useChat();

  // 加载对话列表
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setConversations(data || []);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };

    loadConversations();
  }, [supabase, setConversations]);

  // 删除对话
  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConversations(conversations.filter(conv => conv.id !== id));
      if (currentConversation?.id === id) {
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // 重命名对话
  const renameConversation = async (id: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: newTitle })
        .eq('id', id);

      if (error) throw error;

      setConversations(conversations.map(conv => 
        conv.id === id ? { ...conv, title: newTitle } : conv
      ));
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  // 过滤对话
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 搜索框 */}
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            className={`relative group border-b last:border-b-0 ${
              currentConversation?.id === conv.id ? 'bg-gray-50' : 'hover:bg-gray-50'
            }`}
          >
            <button
              onClick={() => router.push(`/chat/${conv.id}`)}
              className="w-full text-left px-4 py-3 pr-12"
            >
              <div className="truncate text-gray-700">{conv.title}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(conv.created_at).toLocaleDateString()}
              </div>
            </button>

            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(isMenuOpen === conv.id ? null : conv.id);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <MoreVertical size={18} className="text-gray-500" />
              </button>

              {isMenuOpen === conv.id && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-50 py-1">
                  <button
                    onClick={() => {
                      const newTitle = prompt('请输入新的标题', conv.title);
                      if (newTitle) {
                        renameConversation(conv.id, newTitle);
                      }
                      setIsMenuOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                  >
                    重命名
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定要删除这个对话吗？')) {
                        deleteConversation(conv.id);
                      }
                      setIsMenuOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-500"
                  >
                    删除
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 