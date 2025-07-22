import { nanoid } from "nanoid";
import { db } from "@/lib/prisma";
import { Chat } from "@/lib/types/chat";
import { SidebarChat } from "@/lib/types/sidebar";

const formatChat = (chat: Chat): SidebarChat => {
	return {
		id: chat.id,
		title: chat.title,
		isStarred: chat.isStarred,
		createdAt: chat.createdAt,
		updatedAt: chat.updatedAt,
	};
};

export const getUserChats = async (userId: string, params: { limit: number }) => {
	try {
		const { limit } = params;

		const [chats, total] = await Promise.all([
			db.chat.findMany({
				where: { userId },
				orderBy: { updatedAt: "desc" },
				take: limit,
			}),
			db.chat.count({ where: { userId } }),
		]);

		const formattedChats: SidebarChat[] = chats.map((chat) =>
			formatChat(chat)
		);

		return { chats: formattedChats, total };
	} catch (error) {
		console.error("Error fetching chats:", error);
		throw error;
	}
};

export const createChat = async (
	userId: string,
	{ model, initialMessage }: { model: string; initialMessage: string },
) => {
	try {
		let chatId: string;
		let attempts = 0;
		const maxAttempts = 5;

		do {
			chatId = nanoid(16);
			attempts++;

			const existingChat = await db.chat.findUnique({
				where: { id: chatId },
			});

			if (!existingChat) break;

			if (attempts >= maxAttempts) {
				return { error: "Failed to generate a unique chat ID" };
			}
		} while (attempts < maxAttempts);

		const result = await db.$transaction(async (tx) => {
			// Create the chat
			const chat = await tx.chat.create({
				data: {
					id: chatId,
					userId,
					title: "Untitled Chat",
				},
			});

			// Create the initial message if provided
			let message = null;
			if (initialMessage?.trim()) {
				message = await tx.message.create({
					data: {
						chatId: chat.id,
						role: "USER",
						content: initialMessage.trim(),
						model: model,
					},
				});
			}

			return { chat, message };
		});

		return {
			chatId: result.chat.id,
			messageId: result.message?.id,
		};
	} catch (error) {
		console.error("Error creating chat:", error);
		return { error: "Failed to create chat" };
	}
};

export const renameChat = async (
	chatId: string,
	userId: string,
	title: string,
) => {
	try {
		if (!title || title.trim().length === 0) {
			return { error: "Title is required" };
		}

		if (title.length > 100) {
			return { error: "Title must be less than 100 characters" };
		}

		const chat = await db.chat.findUnique({
			where: { id: chatId, userId },
		});

		if (!chat) {
			return { error: "Chat not found or unauthorized" };
		}

		const updatedChat = await db.chat.update({
			where: { id: chatId },
			data: { title: title.trim() },
		});
		return { success: true, chat: formatChat(updatedChat) };
	} catch (error) {
		console.error("Error renaming chat:", error);
		return { error: "Failed to rename chat" };
	}
};

export const toggleStar = async (chatId: string, userId: string) => {
	try {
		const chat = await db.chat.findUnique({
			where: { id: chatId, userId },
		});

		if (!chat) {
			return { error: "Chat not found or unauthorized" };
		}

		const updatedChat = await db.chat.update({
			where: { id: chatId },
			data: { isStarred: !chat.isStarred, updatedAt: new Date() },
		});

		return { success: true, chat: formatChat(updatedChat) };
	} catch (error) {
		console.error("Error toggling star:", error);
		return { error: "Error toggling star" };
	}
};

export const deleteChat = async (chatId: string, userId: string) => {
	try {
		const chat = await db.chat.findUnique({
			where: { id: chatId, userId },
		});
		if (!chat) {
			return { error: "Chat not found or unauthorized" };
		}

		await db.chat.delete({
			where: { id: chatId },
		});

		return { success: true };
	} catch (error) {
		console.error("Error deleting chat:", error);
		return { error: "Error deleting chat" };
	}
};
