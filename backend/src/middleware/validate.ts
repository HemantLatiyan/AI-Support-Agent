import { Request, Response, NextFunction } from 'express';

const MAX_MESSAGE_LENGTH = 2000;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateChatMessage(req: Request, res: Response, next: NextFunction) {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'Message is required and cannot be empty.' });
        return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
        res.status(400).json({
            error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`,
        });
        return;
    }

    if (conversationId !== undefined && (typeof conversationId !== 'string' || !UUID_REGEX.test(conversationId))) {
        res.status(400).json({ error: 'Invalid conversationId format.' });
        return;
    }

    req.body.message = message.trim();
    next();
}

export function validateConversationId(req: Request, res: Response, next: NextFunction) {
    const conversationId = req.params.conversationId;

    if (typeof conversationId !== 'string' || !UUID_REGEX.test(conversationId)) {
        res.status(400).json({ error: 'Invalid conversationId format.' });
        return;
    }

    next();
}
