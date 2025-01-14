'use client';

import { useConversation } from '@/app/context/ConversationContext';
import { PlusCircle, Trash2 } from 'lucide-react';

export function ConversationList() {
  const {
    conversations,
    currentConversation,
    createConversation,
    selectConversation,
    deleteConversation,
    loading,
  } = useConversation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={() => createConversation()}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors m-4"
      >
        <PlusCircle className="w-5 h-5" />
        新对话
      </button>

      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
              currentConversation?.id === conversation.id
                ? 'bg-gray-100'
                : ''
            }`}
          >
            <div
              className="flex-1 truncate mr-2"
              onClick={() => selectConversation(conversation.id)}
            >
              {conversation.title}
            </div>
            <button
              onClick={() => deleteConversation(conversation.id)}
              className="p-1 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 