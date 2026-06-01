export type Sender = 'user' | 'ai';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
}

export interface SendResult {
  reply: string;
  conversationId: string;
}

export interface StoredMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  createdAt: string;
}
