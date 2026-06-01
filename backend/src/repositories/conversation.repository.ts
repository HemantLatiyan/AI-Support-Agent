import { db } from '../db';
import { conversations } from '../db/schema';
// import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export async function createConversation() {
    const conversation = {
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await db.insert(conversations).values(conversation);
    return conversation;
};

// export async function getConversationById(id: string) {
//     const result = await db
//         .select()
//         .from(conversations)
//         .where(eq(conversations.id, id));

//     return result[0] || null;
// };