import { db } from "@/lib/prisma";
import { callGroq } from "@/lib/ai/groq";

export const getMessagesById = async (chatId: string, userId: string) => {
    try {
        const chat = await db.chat.findUnique({
		where: { id: chatId, userId },
		include: { messages: true },
	});

	if (!chat) {
		return { error: "Chat not found" };
	}

	return {
		messages: chat.messages,
		success: true,
	};
    } catch (error) {
        console.error("Error fetching messages: ", error);
        return { error: "Failed to fetch messages" };
    }
};

export const generateAiResponse = async (chatId: string, userId: string, message: string, model: string) => {
    try {
       const chat = await db.chat.findUnique({
			where: {
				id: chatId,
				userId: userId,
			},
			include: { messages: true },
       });

       if (!chat) {
        return { error: "Chat not found" };
       }

        // if not the first message
        if (chat.messages.length > 1) {
			await db.message.create({
				data: {
					chatId: chatId,
					role: "USER",
					content: message.trim(),
					model: model,
				},
			});
        }
        
        const stream = await callGroq(message, model);

		let completeResponse = "";
		const transformStream = new TransformStream({
			transform(chunk, controller) {
				const text = new TextDecoder().decode(chunk);
				completeResponse += text;
				controller.enqueue(chunk);
			},
			flush() {
				// save AI response to database
				db.message
					.create({
						data: {
							chatId,
							role: "ASSISTANT",
							content: completeResponse,
							model: model,
						},
					})
					.catch(console.error);
			},
        });
        
        // update chat updatedAt
        await db.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
        });

        return {
            stream: stream.pipeThrough(transformStream),
            success: true,
        }
    } catch (error) {
        console.error("Error generating AI response: ", error);
        return { error: "Failed to generate AI response" };
    }
}