import { db } from "@/lib/prisma";

const verifyChatOwner = async (chatId: string, userId: string) => {
    
}

export const getMessages = async (
	chatId: string,
	userId: string,
	options: { limit?: number; offset?: number }
) => {
	const { limit = 50, offset = 0 } = options;

	// verify owner
	const hasAccess = await verifyChatOwner(chatId, userId);
	if (!hasAccess) {
		return null;
	}
};
