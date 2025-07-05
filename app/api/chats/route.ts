import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createChat, getUserChats } from "@/lib/services/chat";

// GET /api/chats - Get all user's chats
export async function GET(req: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(req.url);
		const limit = parseInt(searchParams.get("limit") || "50");
		const offset = parseInt(searchParams.get("offset") || "0");

		const userChats = await getUserChats(session.user.id, {
			limit,
			offset,
		});

		return NextResponse.json({
			chats: userChats.chats,
			pagination: {
				limit: limit,
				offset: offset,
				total: userChats.total,
			},
		});
	} catch (error) {
		console.error("Error fetching chats: ", error);
		return NextResponse.json(
			{ error: "Failed to fetch chats" },
			{ status: 500 }
		);
	}
}

// POST /api/chats - Create a new chat
export async function POST(req: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { model, initialMessage } = await req.json();
		if (!initialMessage) {
			return NextResponse.json(
				{ error: "Initial message is required" },
				{ status: 400 }
			);
		}

		const chatId = await createChat(
			model || "deepseek-r1-distill-llama-70b",
			initialMessage
		);
		return NextResponse.json(chatId, { status: 200 });
	} catch (error) {
		console.error("Error creating chat: ", error);
		return NextResponse.json(
			{ error: "Failed to create chat" },
			{ status: 500 }
		);
	}
}
