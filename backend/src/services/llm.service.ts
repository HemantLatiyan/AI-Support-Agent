import { gemini } from '../lib/gemini';

type Message = {
    role: string;
    content: string;
};

class LlmError extends Error {
    isLlmError = true;
    constructor(message: string) {
        super(message);
        this.name = 'LlmError';
    }
}

function classifyLlmError(error: any): LlmError {
    const msg: string = error?.message ?? '';
    if (msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
        return new LlmError('AI service configuration error. Please contact support.');
    }
    if (msg.includes('429') || msg.includes('rate limit') || msg.includes('quota')) {
        return new LlmError('AI service is busy. Please try again in a moment.');
    }
    if (msg.includes('timeout') || msg.includes('ETIMEDOUT') || msg.includes('ECONNREFUSED')) {
        return new LlmError('AI service is temporarily unavailable. Please try again.');
    }
    return new LlmError('Sorry, I could not generate a response. Please try again.');
}

const MAX_HISTORY_MESSAGES = 20;

function buildPrompt(history: Message[], userMessage: string): string {
    const systemPrompt = `You are a helpful customer support assistant for a fictional e-commerce store called ShopEasy.

        Store policies:
        - Shipping takes 3-5 business days domestically, 7-14 days internationally
        - Returns allowed within 30 days of delivery, items must be unused and in original packaging
        - Refunds are processed within 5-7 business days after the return is received
        - Support hours are 9 AM to 6 PM IST, Monday to Saturday
        - We ship to over 50 countries worldwide

        Answer clearly and concisely. If asked about something outside customer support, politely redirect the conversation.`;

    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
    const conversationHistory = recentHistory
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');

    return `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nUser:\n${userMessage}`;
}

export async function generateReply(history: Message[], userMessage: string): Promise<string> {
    try {
        const response = await gemini.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: buildPrompt(history, userMessage),
        });
        return response.text || 'Sorry, I could not generate a response.';
    } catch (error: any) {
        console.error('LLM error:', error);
        throw classifyLlmError(error);
    }
}

export async function generateReplyStream(history: Message[], userMessage: string) {
    try {
        const response = await gemini.models.generateContentStream({
            model: 'gemini-3.5-flash',
            contents: buildPrompt(history, userMessage),
        });
        return response;
    } catch (error: any) {
        console.error('LLM stream error:', error);
        throw classifyLlmError(error);
    }
}
