import { z } from "zod";
import { DEFAULT_MODEL } from "@/lib/ai/models";
import { NextRequest, NextResponse } from "next/server";
import { getUserChats, createChat } from "@/lib/services/chat";
import { authenticateUser } from "@/lib/services/auth";

const ITEMS_PER_PAGE = 30;

// Validation schemas
const paginationSchema = z.object({
	limit: z.coerce.number().min(1).max(100).optional(),
});

const createChatSchema = z.object({
	model: z.string().optional(),
	initialMessage: z.string().min(1).trim(),
});

// GET /api/chats - Get all chats
export async function GET(req: NextRequest) {
	try {
		const { userId } = await authenticateUser();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const params = paginationSchema.parse({
			limit: searchParams.get("limit"),
		});

		// If limit is provided, use it; otherwise get all chats
		const limit = params.limit ?? ITEMS_PER_PAGE;

		const result = await getUserChats(userId, { limit });

		return NextResponse.json({
			chats: result.chats,
			pagination: {
				limit: limit,
				total: result.total,
			},
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid parameters", details: error.errors },
				{ status: 400 },
			);
		}

		console.error("Error fetching chats:", error);
		return NextResponse.json(
			{ error: "Failed to fetch chats" },
			{ status: 500 },
		);
	}
}

// POST /api/chats - Create a new chat
export async function POST(req: NextRequest) {
	try {
		const { userId } = await authenticateUser();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { model, initialMessage } = createChatSchema.parse(await req.json());

		const chatId = await createChat(userId, {
			model: model ?? DEFAULT_MODEL,
			initialMessage,
		});

		return NextResponse.json(chatId, { status: 200 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request body", details: error.errors },
				{ status: 400 },
			);
		}

		console.error("Error creating chat:", error);
		return NextResponse.json(
			{ error: "Failed to create chat" },
			{ status: 500 },
		);
	}
}
