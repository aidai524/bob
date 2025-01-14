import Link from 'next/link';
import { Navbar } from './components/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">欢迎使用 AI Chat</h1>
          <p className="text-lg text-gray-600 mb-8">
            开始与 AI 助手进行对话
          </p>
          <Link
            href="/chat"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            开始聊天
          </Link>
        </div>
      </main>
    </div>
  );
}
