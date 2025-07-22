import { db } from "@/lib/prisma";

const cache = new Map<string, { data: ProfileStats; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export interface ProfileStats {
	totalChats: number;
	totalMessages: number;
	estimatedTokens: number;
}

function estimateTokens(content: string): number {
	return Math.ceil(content.length / 4);
}

export async function getProfileStats(
	userId: string,
	forceRefresh = false,
): Promise<ProfileStats> {
	const cacheKey = `profile_stats_${userId}`;

	if (!forceRefresh) {
		const cached = cache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			return cached.data;
		}
	}

	const [chatStats, messageCount] = await Promise.all([
		db.chat.count({
			where: { userId },
		}),

		db.message.count({
			where: {
				chat: { userId },
			},
		}),
	]);

	// Get message content for token estimation (limit to avoid memory issues)
	const recentMessages = await db.message.findMany({
		where: {
			chat: { userId },
		},
		select: { content: true },
		orderBy: { createdAt: "desc" },
		take: 1000, // Sample recent messages for token estimation
	});

	const sampledTokens = recentMessages.reduce((acc, msg) => {
		return acc + estimateTokens(msg.content);
	}, 0);

	// Extrapolate to total if we have more messages than sampled
	const totalMessages = messageCount;
	const estimatedTokens =
		totalMessages <= 1000
			? sampledTokens
			: Math.round((sampledTokens / recentMessages.length) * totalMessages);

	const stats: ProfileStats = {
		totalChats: chatStats,
		totalMessages: totalMessages,
		estimatedTokens: estimatedTokens,
	};

	cache.set(cacheKey, {
		data: stats,
		timestamp: Date.now(),
	});

	return stats;
}
