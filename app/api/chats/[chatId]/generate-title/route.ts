import { auth } from "@/lib/auth";
import { getChatById, renameChat } from "@/lib/services/chat";
import { NextRequest, NextResponse } from "next/server";
import { generateAIChatTitle } from "@/lib/ai/ai-title";

// POST /api/chats/[chatId]/generate-title - Generate a title for a chat
export async function POST(
	req: NextRequest,
	{ params }: { params: { chatId: string } }
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
		const { chatId } = await params;
		if (!chatId) {
			return NextResponse.json(
				{ error: "Chat ID is required" },
				{ status: 400 }
			);
		}

		const { userMessage } = await req.json();
		if (!userMessage) {
			return NextResponse.json(
				{ error: "User message is required" },
				{ status: 400 }
			);
		}

		// verify that chat belongs to user
		const chat = await getChatById(chatId, session.user.id);

		if (!chat) {
			return NextResponse.json(
				{ error: "Chat not found or unauthorized" },
				{ status: 404 }
			);
		}

		const generatedTitle = await generateAIChatTitle(userMessage);
		if (
			chat.title === "Untitled Chat" &&
			generatedTitle !== "Untitled Chat"
		) {
			await renameChat(chatId, session.user.id, generatedTitle);
		}

		return NextResponse.json({ title: generatedTitle });
	} catch (error) {
		console.error("Error generating chat title:", error);
		return NextResponse.json(
			{ error: "Failed to generate chat title" },
			{ status: 500 }
		);
	}
}
