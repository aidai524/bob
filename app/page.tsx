import { ChatProvider } from './context/ChatContext';
import { ChatInput } from './components/ChatInput';
import { MessageList } from './components/MessageList';

export default function Home() {
  return (
    <ChatProvider>
      <main className="flex flex-col h-screen max-h-screen">
        <MessageList />
        <ChatInput />
      </main>
    </ChatProvider>
  );
}
