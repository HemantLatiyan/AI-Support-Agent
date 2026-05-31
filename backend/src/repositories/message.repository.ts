import { db } from '../db';
import { messages } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../lib/redis';

const CACHE_TTL = 60 * 30; // 30 minutes

function cacheKey(conversationId: string) {
    return `conversation:${conversationId}:messages`;
}

export async function createMessage(
    conversationId: string,
    content: string,
    role: 'user' | 'agent' | 'system'
) {
    const message = {
        id: uuidv4(),
        conversationId,
        content,
        role,
        createdAt: new Date(),
    };

    await db.insert(messages).values(message);

    // Append to cache in-place so subsequent reads still hit cache
    try {
        const key = cacheKey(conversationId);
        const cached = await redis.get(key);
        if (cached) {
            const existing = JSON.parse(cached);
            existing.push(message);
            await redis.set(key, JSON.stringify(existing), 'EX', CACHE_TTL);
        }
    } catch {
        // Cache failure is non-fatal — DB is the source of truth
    }

    return message;
}

export async function getMessagesByConversationId(conversationId: string) {
    const key = cacheKey(conversationId);

    try {
        const cached = await redis.get(key);
        if (cached) {
            console.log('Cache hit for conversation messages');
            return JSON.parse(cached);
        }
    } catch {
        // Cache failure is non-fatal — just log and continue to DB
    }

    console.log('Cache miss for conversation messages, querying database');

    const result = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));

    try {
        await redis.set(key, JSON.stringify(result), 'EX', CACHE_TTL);
    } catch {
        // Cache failure is non-fatal
    }

    return result;
}
