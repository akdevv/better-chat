import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateAiResponse, getMessagesById } from "@/lib/services/message";

// GET /api/chat/[chatId]/messages - Get all messages for a chat
export async function GET(
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
		const result = await getMessagesById(chatId, session.user.id);

		if (!result.success) {
			return NextResponse.json(
				{ error: "Failed to fetch messages" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ messages: result.messages });
	} catch (error) {
		console.error("Error fetching messages: ", error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 }
		);
	}
}

// POST /api/chat/[chatId]/messages - Send message and get AI response
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
		const { message, model } = await req.json();

		if (!message.trim()) {
			return NextResponse.json(
				{ error: "Message is required" },
				{ status: 400 }
			);
		}

		const result = await generateAiResponse(
			chatId,
			session.user.id,
			message,
			model
		);

		if (!result.success) {
			return NextResponse.json(
				{ error: "Failed to generate AI response" },
				{ status: 500 }
			);
		}

		return new Response(result.stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Transfer-Encoding": "chunked",
			},
		});
	} catch (error) {
		console.error("Error sending message: ", error);
		return NextResponse.json(
			{ error: "Failed to send message" },
			{ status: 500 }
		);
	}
}
