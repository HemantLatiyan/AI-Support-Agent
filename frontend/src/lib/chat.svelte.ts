import { tick } from 'svelte';
import { sendMessage, fetchHistory } from './api';
import type { Message } from './types';

export class ChatStore {
  messages: Message[] = $state([]);
  input: string = $state('');
  loading: boolean = $state(false);
  error: string = $state('');
  conversationId: string | undefined = $state(undefined);
  messagesEl: HTMLDivElement | null = $state(null);

  async init() {
    const saved = localStorage.getItem('conversationId');
    if (!saved) return;

    this.conversationId = saved;
    try {
      const history = await fetchHistory(saved);
      this.messages = history
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          id: m.id,
          sender: (m.role === 'agent' ? 'ai' : 'user') as 'ai' | 'user',
          text: m.content,
          timestamp: new Date(m.createdAt)
        }));
      await this.scrollToBottom();
    } catch {
      localStorage.removeItem('conversationId');
      this.conversationId = undefined;
    }
  }

  async scrollToBottom() {
    await tick();
    this.messagesEl?.scrollTo({ top: this.messagesEl.scrollHeight, behavior: 'smooth' });
  }

  async send() {
    const text = this.input.trim();
    if (!text || this.loading) return;

    this.input = '';
    this.error = '';

    this.messages = [
      ...this.messages,
      { id: crypto.randomUUID(), sender: 'user', text, timestamp: new Date() }
    ];
    await this.scrollToBottom();

    this.loading = true;
    try {
      const result = await sendMessage(text, this.conversationId);

      if (!this.conversationId) {
        this.conversationId = result.conversationId;
        localStorage.setItem('conversationId', this.conversationId);
      }

      this.messages = [
        ...this.messages,
        { id: crypto.randomUUID(), sender: 'ai', text: result.reply, timestamp: new Date() }
      ];
    } catch (e: any) {
      this.error = e.message ?? 'Something went wrong.';
    } finally {
      this.loading = false;
      await this.scrollToBottom();
    }
  }

  handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  suggest(text: string) {
    this.input = text;
    this.send();
  }

  newChat() {
    this.messages = [];
    this.conversationId = undefined;
    this.error = '';
    localStorage.removeItem('conversationId');
  }

  formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
