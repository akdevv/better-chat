import { db } from "@/lib/prisma";
import { sendMessageToAIWithHistory } from "@/lib/ai/model-router";

export const getMessages = async (chatId: string, userId: string) => {
	try {
		const chat = await db.chat.findUnique({
			where: { id: chatId, userId },
			include: {
				messages: {
					include: {
						messageFiles: {
							include: {
								uploadedFile: true,
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				},
			},
		});
		if (!chat) {
			return { error: "Chat not found" };
		}

		return {
			messages: chat.messages.map((msg) => {
				const { messageFiles, ...messageWithoutFiles } = msg;
				return {
					...messageWithoutFiles,
					files: messageFiles.map((file) => ({
						id: file.uploadedFile.id,
						name: file.uploadedFile.originalName,
						fileGroup: file.uploadedFile.fileGroup,
					})),
				};
			}),
		};
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
	fileIds: string[] = [],
	temperature: number,
	maxTokens: number,
	signal?: AbortSignal,
) => {
	try {
		if (signal?.aborted) {
			return { error: "Request was cancelled" };
		}

		const chat = await db.chat.findUnique({
			where: { id: chatId, userId },
			include: {
				messages: {
					include: {
						messageFiles: {
							include: {
								uploadedFile: true,
							},
						},
					},
				},
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
			{ signal, fileIds, temperature, maxTokens },
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

export const savePartialMessage = async (
	chatId: string,
	content: string,
	model: string,
) => {
	try {
		let finalContent = content;
		if (
			finalContent.includes("<think>") &&
			!finalContent.includes("</think>")
		) {
			finalContent += "</think>";
		}

		await db.message.create({
			data: { chatId, role: "ASSISTANT", content: finalContent, model },
		});

		// Update chat timestamp
		await db.chat.update({
			where: { id: chatId },
			data: { updatedAt: new Date() },
		});

		return { success: true };
	} catch (error) {
		console.error("Error saving partial message: ", error);
		return { error: "Failed to save partial message" };
	}
};
