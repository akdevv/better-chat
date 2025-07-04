import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { nanoid } from "nanoid";

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

		return {
			chats: chats.map((chat) => ({
				id: chat.id,
				title: chat.title,
				createdAt: chat.createdAt,
				updatedAt: chat.updatedAt,
			})),
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
