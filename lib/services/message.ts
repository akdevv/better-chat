import { db } from "@/lib/prisma";
import { sendMessageToAIWithHistory } from "@/lib/ai/model-router";

export const getMessages = async (chatId: string, userId: string) => {
	try {
		const chat = await db.chat.findUnique({
			where: { id: chatId, userId },
			include: {
				messages: {
					orderBy: {
						createdAt: "asc",
					},
				},
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
		const existingMessage = await db.message.findFirst({
			where: { chatId, role: "USER", content: message.trim() },
			orderBy: { createdAt: "desc" },
		});

		if (!existingMessage) {
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

		const stream = await sendMessageToAIWithHistory(
			chat.messages,
			message,
			model,
			userId,
			{ signal }
		);
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
