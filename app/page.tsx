'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { MessageCircle, Sparkles, Zap, Send, Bot } from 'lucide-react';

// Popular conversation starters
const popularPrompts = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    text: "Who is Satoshi Nakamoto"
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    text: "What is Uniswap"
  },
  {
    icon: <Zap className="w-5 h-5" />,
    text: "Latest news about OpenAI Sora"
  }
];

export default function HomePage() {
  const router = useRouter();
  const { setPendingMessage } = useApp();
  const [input, setInput] = useState('');

  // Handle form submission and navigate to chat
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Save message to context
    setPendingMessage(input.trim());
    
    // Navigate to chat page
    router.push('/chat/new');
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="ml-24 flex-1">
        <div className="max-w-3xl mx-auto p-6">
          {/* Welcome section */}
          <div className="flex flex-col items-center mb-8 mt-40">
            <div className="flex items-center h-16 gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-8 h-8 text-indigo-600" />
                <h1 className="text-xl font-medium text-gray-800 flex items-center h-full">
                  I am BOB AI, nice to meet you!
                </h1>
              </div>
            </div>
            <p className="text-gray-500 text-xs">
              I can help you with WEB3 consulting, check cryptocurrency prices, and even assist with transactions!
            </p>
          </div>

          {/* Input section */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything... (Press Enter to send, Shift + Enter for new line)"
                  className="w-full px-4 py-4 pr-32 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none"
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
                  disabled={!input.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  title="Send"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>

          {/* Popular prompts */}
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

      <Footer />
    </div>
  );
}

export function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}
