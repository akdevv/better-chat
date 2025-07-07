import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { callGroq } from "@/lib/ai/callGroq";

export const getMessages = async (chatId: string, userId: string) => {
	try {
		const chat = await db.chat.findUnique({
			where: { id: chatId, userId },
			include: {
				messages: true,
			},
		});
		if (!chat) {
			return { error: "Chat not found" };
		}

		return { messages: chat.messages };
	} catch (error) {
		console.error("Error fetching messages: ", error);
		return { error: "Failed to fetch messages" };
	}
};

export const sendMessage = async (
	chatId: string,
	userId: string,
	message: string,
	model: string,
	signal?: AbortSignal
) => {
	try {
		if (signal?.aborted) {
			return { error: "Request was cancelled" };
		}

		const chat = await db.chat.findUnique({
			where: { id: chatId, userId },
			include: {
				messages: true,
			},
		});
		if (!chat) {
			return { error: "Chat not found" };
		}

		// if not the first message, create new message
		if (chat.messages.length !== 0) {
			await db.message.create({
				data: {
					chatId,
					role: "USER",
					content: message.trim(),
					model,
				},
			});
		}

		// Check cancellation before making AI call
		if (signal?.aborted) {
			return { error: "Request was cancelled" };
		}

		const stream = await callGroq(message, model, signal);
		let completeResponse = "";

		const transformStream = new TransformStream({
			transform(chunk, controller) {
				if (signal?.aborted) {
					controller.terminate();
					return;
				}
				const text = new TextDecoder().decode(chunk);
				completeResponse += text;
				controller.enqueue(chunk);
			},
			flush() {
				if (!signal?.aborted && completeResponse.trim()) {
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
				}

				// Update chat timestamp
				db.chat
					.update({
						where: { id: chatId },
						data: { updatedAt: new Date() },
					})
					.catch(console.error);
			},
		});

		return {
			stream: stream.pipeThrough(transformStream),
			success: true,
		};
	} catch (error) {
		console.error("Error sending message: ", error);
		return { error: "Failed to send message" };
	}
};

// Helper functions
export async function authenticateUser() {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized", userId: null };
	}
	return { error: null, userId: session.user.id };
}
