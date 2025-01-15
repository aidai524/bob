'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Search, Clock, CalendarDays, Calendar, MessageSquare } from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Sidebar } from '@/app/components/Sidebar';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  last_message?: string;
}

interface GroupedConversations {
  [key: string]: Conversation[];
}

export default function HistoryPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<GroupedConversations>({});

  // 加载会话列表
  useEffect(() => {
    async function loadConversations() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          created_at,
          messages (
            content,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }

      setConversations(data || []);
    }

    loadConversations();
  }, [supabase]);

  // 处理搜索和分组
  useEffect(() => {
    const filtered = conversations.filter(conv => 
      conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = filtered.reduce((acc: GroupedConversations, conv) => {
      const date = new Date(conv.created_at);
      let group = '';

      if (isToday(date)) {
        group = '今天';
      } else if (isThisWeek(date)) {
        group = '本周';
      } else if (isThisMonth(date)) {
        group = '本月';
      } else if (isThisYear(date)) {
        group = '今年';
      } else {
        group = '更早';
      }

      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(conv);
      return acc;
    }, {});

    setFilteredConversations(grouped);
  }, [conversations, searchTerm]);

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE', { locale: zhCN });
    } else {
      return format(date, 'MM月dd日');
    }
  };

  // 获取分组图标
  const getGroupIcon = (group: string) => {
    switch (group) {
      case '今天':
        return <Clock className="w-4 h-4" />;
      case '本周':
        return <CalendarDays className="w-4 h-4" />;
      case '本月':
      case '今年':
      case '更早':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <Sidebar />
      
      {/* 主要内容区域 */}
      <main className="ml-24 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">历史会话</h1>
          
          {/* 搜索框 */}
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="搜索历史会话..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>

          {/* 会话列表 */}
          <div className="space-y-8">
            {Object.entries(filteredConversations).map(([group, convs]) => (
              convs.length > 0 && (
                <div key={group} className="space-y-3">
                  {/* 时间分组标题 */}
                  <h2 className="text-sm font-medium text-gray-500 px-2 flex items-center gap-2">
                    {getGroupIcon(group)}
                    {group}
                  </h2>
                  
                  {/* 会话列表 */}
                  <div className="space-y-2">
                    {convs.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => router.push(`/chat/${conv.id}`)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow hover:shadow-md transition-shadow text-left"
                      >
                        <MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 font-medium truncate">
                              {conv.title}
                            </span>
                            <span className="text-sm text-gray-500 flex-shrink-0 ml-4">
                              {formatDate(conv.created_at)}
                            </span>
                          </div>
                          {conv.last_message && (
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {conv.last_message}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 