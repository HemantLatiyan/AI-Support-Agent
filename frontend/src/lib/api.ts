const BASE = 'http://localhost:8000';

import type { SendResult, StoredMessage } from './types';

export async function sendMessage(
  message: string,
  conversationId?: string
): Promise<SendResult> {
  const res = await fetch(`${BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Something went wrong. Please try again.');
  }

  return res.json();
}

export async function fetchHistory(conversationId: string): Promise<StoredMessage[]> {
  const res = await fetch(`${BASE}/chat/${conversationId}/messages`);
  if (!res.ok) throw new Error('Failed to load history.');
  return res.json();
}