import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { SidebarChat } from "@/lib/types/sidebar";

export const getChatById = async (chatId: string, userId: string) => {
	try {
		const chat = await db.chat.findUnique({
			where: { id: chatId, userId },
		});

		return chat;
	} catch (error) {
		console.error("Error fetching chat by ID:", error);
		return null;
	}
};

export const getUserChats = async (
	userId: string,
	options: { limit?: number; offset?: number }
) => {
	try {
		const { limit = 50, offset = 0 } = options;

		const [chats, total] = await Promise.all([
			db.chat.findMany({
				where: { userId },
				orderBy: { updatedAt: "desc" },
				take: limit,
				skip: offset,
			}),
			db.chat.count({ where: { userId } }),
		]);

		const formattedChats: SidebarChat[] = chats.map((chat) => ({
			id: chat.id,
			title: chat.title,
			isStarred: chat.isStarred,
			createdAt: chat.createdAt,
			updatedAt: chat.updatedAt,
		}));

		return {
			chats: formattedChats,
			total,
		};
	} catch (error) {
		console.error("Error fetching chats: ", error);
		return { error: "Error fetching chats" };
	}
};

export const createChat = async (model: string, initialMessage: string) => {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { error: "Unauthorized" };
		}

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
					userId: session.user?.id as string,
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

		return { chatId: result.chat.id };
	} catch (error) {
		console.error("Error creating chat:", error);
		return { error: "Error creating chat" };
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

export const renameChat = async (
	chatId: string,
	userId: string,
	title: string
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
			select: {
				id: true,
				title: true,
				isStarred: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return { success: true, chat: updatedChat };
	} catch (error) {
		console.error("Error renaming chat:", error);
		return { error: "Error renaming chat" };
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
			select: {
				id: true,
				title: true,
				isStarred: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return { success: true, chat: updatedChat };
	} catch (error) {
		console.error("Error toggling star:", error);
		return { error: "Error toggling star" };
	}
};
