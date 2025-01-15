export interface Message {
  id: number;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  updated_at?: string;
} 