import {sqliteTable, text, integer} from 'drizzle-orm/sqlite-core';

export const conversations = sqliteTable('conversations', {
    id: text('id').primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

export const messages = sqliteTable('messages', {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id').notNull().references(() => conversations.id),
    content: text('content').notNull(),
    role: text('role', { enum: ['user', 'agent', 'system'] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),  
});

