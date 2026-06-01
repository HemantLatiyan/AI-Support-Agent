import { createConversation, getConversationById } from '../repositories/conversation.repository';
import { createMessage, getMessagesByConversationId } from '../repositories/message.repository';
import { generateReply, generateReplyStream } from './llm.service';
import { Response } from 'express';

export async function handleChatMessage(
    message: string,
    conversationId?: string,
) {
    let conversation;

    if (!conversationId || !(await getConversationById(conversationId))) {
        conversation = await createConversation();
        conversationId = conversation.id;
    }

    await createMessage(conversationId, message, 'user');

    const history = await getMessagesByConversationId(conversationId);

    console.log('Conversation history:', history);

    // Generate AI reply using LLM service
    const aiReply = await generateReply(history, message);
    
    await createMessage(conversationId, aiReply, 'agent');

    return {
        reply: aiReply,
        conversationId,
    };
}

export async function getConversationMessages(
  conversationId: string
) {
  return await getMessagesByConversationId(conversationId);
}

export async function handleChatMessageStream(
  message: string,
  conversationId: string,
  res: Response
) {
    let finalConversationId = conversationId;
    
    if(!finalConversationId) {
        const conversation = await createConversation();
        finalConversationId = conversation.id;
    }

    await createMessage(finalConversationId, message, 'user');

    const history = await getMessagesByConversationId(finalConversationId);

    const stream = await generateReplyStream(history, message);

    let fullReply = "";
    
    for await (const chunk of stream) {
        const content = chunk.text;
        if (!content) continue;
        fullReply += content;
        if (res) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
    }

    await createMessage(finalConversationId, fullReply, 'agent');

    res.write(
        `data: ${JSON.stringify({done: true, conversationId: finalConversationId })}\n\n`
    )
}