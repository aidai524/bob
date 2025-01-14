import { Sidebar } from '@/app/components/Sidebar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 左侧边栏 */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 h-auto">
        <Sidebar />
      </div>

      {/* 主内容区域 */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 