import { NextRequest, NextResponse } from "next/server";
import { getMessages, sendMessage } from "@/lib/services/message";
import { authenticateUser } from "@/lib/services/auth";

// GET /chats/:chatId/messages => get all messages for a chat
export async function GET(
	req: NextRequest,
	{ params }: { params: { chatId: string } },
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
			{ status: 500 },
		);
	}
}

// POST /api/chats/:chatId/messages - Send message & get AI response
export async function POST(
	req: NextRequest,
	{ params }: { params: { chatId: string } },
) {
	try {
		const { error, userId } = await authenticateUser();
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const { chatId } = await params;

		const { message, model } = await req.json();
		if (!message.trim() || !model) {
			return NextResponse.json(
				{ error: "Message and model are required" },
				{ status: 400 },
			);
		}

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
			abortController.signal,
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
			{ status: 500 },
		);
	}
}

// PATCH /api/chats/:chatId/messages - Save partial message when stopped
export async function PATCH(
	req: NextRequest,
	{ params }: { params: { chatId: string } },
) {
	try {
		const { error, userId } = await authenticateUser();
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const { chatId } = await params;
		const { content, model } = await req.json();

		if (!content || !model) {
			return NextResponse.json(
				{ error: "Content and model are required" },
				{ status: 400 },
			);
		}

		// Process thinking response content
		let finalContent = content;
		if (finalContent.includes("<think>") && !finalContent.includes("</think>")) {
			finalContent += "</think>";
		}

		// Import db here to avoid circular dependency
		const { db } = await import("@/lib/prisma");
		
		// Save the partial message to database
		await db.message.create({
			data: {
				chatId,
				role: "ASSISTANT",
				content: finalContent,
				model,
			},
		});

		// Update chat timestamp
		await db.chat.update({
			where: { id: chatId },
			data: { updatedAt: new Date() },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error saving partial message:", error);
		return NextResponse.json(
			{ error: "Failed to save partial message" },
			{ status: 500 },
		);
	}
}
