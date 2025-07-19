import { NextRequest, NextResponse } from "next/server";
import {
	getMessages,
	sendMessage,
	savePartialMessage,
} from "@/lib/services/message";
import { authenticateUser } from "@/lib/services/auth";
import { db } from "@/lib/prisma";

// GET /chats/:chatId/messages => get all messages for a chat
export async function GET(
	req: NextRequest,
	{ params }: { params: { chatId: string } }
) {
	try {
		const { error, userId } = await authenticateUser();
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const { chatId } = await params;
		const result = await getMessages(chatId, userId!);
		if (result.error) {
			return NextResponse.json({ error: result.error }, { status: 404 });
		}

		return NextResponse.json(result.messages);
	} catch (error) {
		console.error("Error fetching messages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 }
		);
	}
}

// POST /api/chats/:chatId/messages - Send message & get AI response
export async function POST(
	req: NextRequest,
	{ params }: { params: { chatId: string } }
) {
	try {
		const { error, userId } = await authenticateUser();
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const { chatId } = await params;

		const {
			message,
			model,
			generateAIResponse = false,
			fileIds = [],
			temperature,
			maxTokens,
		} = await req.json();
		console.log(
			"fileIds in route POST /api/chats/:chatId/messages",
			fileIds
		);
		if (!message.trim() || !model) {
			return NextResponse.json(
				{ error: "Message and model are required" },
				{ status: 400 }
			);
		}

		// If generateAIResponse is false, just create the user message and return JSON
		if (!generateAIResponse) {
			// Create user message only
			const userMessage = await db.message.create({
				data: {
					chatId,
					role: "USER",
					content: message.trim(),
					model,
				},
			});

			return NextResponse.json({
				id: userMessage.id,
				chatId: userMessage.chatId,
				role: userMessage.role,
				content: userMessage.content,
				createdAt: userMessage.createdAt,
				model: userMessage.model,
			});
		}

		// Generate AI response (existing behavior)
		const abortController = new AbortController();
		if (req.signal) {
			req.signal.addEventListener("abort", () => {
				abortController.abort();
			});
		}

		const result = await sendMessage(
			chatId,
			userId!,
			message,
			model,
			fileIds,
			temperature,
			maxTokens,
			abortController.signal
		);
		if (result.error) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return new Response(result.stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Transfer-Encoding": "chunked",
			},
		});
	} catch (error) {
		console.error("Error sending message:", error);
		return NextResponse.json(
			{ error: "Failed to send message" },
			{ status: 500 }
		);
	}
}

// PATCH /api/chats/:chatId/messages - Save partial message when stopped
export async function PATCH(
	req: NextRequest,
	{ params }: { params: { chatId: string } }
) {
	try {
		const { error } = await authenticateUser();
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const { chatId } = await params;
		const { content, model } = await req.json();

		if (!content || !model) {
			return NextResponse.json(
				{ error: "Content and model are required" },
				{ status: 400 }
			);
		}

		const result = await savePartialMessage(chatId, content, model);
		if (result.error) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error saving partial message:", error);
		return NextResponse.json(
			{ error: "Failed to save partial message" },
			{ status: 500 }
		);
	}
}
