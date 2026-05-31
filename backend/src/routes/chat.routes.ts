import { Router, Response } from 'express';
import { handleChatMessage, getConversationMessages, handleChatMessageStream } from '../services/chat.service';
import { chatRateLimiter } from '../middleware/rateLimiter';
import { validateChatMessage, validateConversationId } from '../middleware/validate';

const router = Router();

router.post('/message', chatRateLimiter, validateChatMessage, async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        const result = await handleChatMessage(message, conversationId);
        res.json(result);
    } catch (error: any) {
        console.error('Error handling chat message:', error);
        const userMessage = error.isLlmError
            ? error.message
            : 'Something went wrong. Please try again.';
        res.status(error.isLlmError ? 502 : 500).json({ error: userMessage });
    }
});

router.get('/:conversationId/messages', validateConversationId, async (req, res) => {
    try {
        const conversationId = req.params.conversationId as string;
        const messages = await getConversationMessages(conversationId);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching conversation messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages.' });
    }
});

router.post('/stream', chatRateLimiter, validateChatMessage, async (req, res: Response) => {
    try {
        const { message, conversationId } = req.body;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        await handleChatMessageStream(message, conversationId, res);
        res.end();
    } catch (error: any) {
        console.error('Error handling chat message stream:', error);
        const userMessage = error.isLlmError
            ? error.message
            : 'Streaming failed. Please try again.';
        res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
        res.end();
    }
});

export default router;
