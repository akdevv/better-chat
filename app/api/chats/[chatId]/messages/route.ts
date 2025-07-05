import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { callGroq } from "@/lib/ai/groq";
import { NextRequest, NextResponse } from "next/server";

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

		const chat = await db.chat.findUnique({
			where: {
				id: chatId,
				userId: session.user.id,
			},
			include: { messages: true },
		});

		if (!chat) {
			return NextResponse.json(
				{ error: "Chat not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ messages: chat.messages });
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

		const chat = await db.chat.findUnique({
			where: {
				id: chatId,
				userId: session.user.id,
			},
			include: { messages: true },
		});

		if (!chat) {
			return NextResponse.json(
				{ error: "Chat not found" },
				{ status: 404 }
			);
		}

		// if not initial message, create a new message
		if (chat.messages.length > 1) {
			await db.message.create({
				data: {
					chatId: chatId,
					role: "USER",
					content: message.trim(),
					model: model,
				},
			});
		}

		const stream = await callGroq(message, model);

		let completeResponse = "";
		const transformStream = new TransformStream({
			transform(chunk, controller) {
				const text = new TextDecoder().decode(chunk);
				completeResponse += text;
				controller.enqueue(chunk);
			},
			flush() {
				// save AI response to database
				db.message
					.create({
						data: {
							chatId,
							role: "ASSISTANT",
							content: completeResponse,
							model: model,
						},
					})
					.catch(console.error);
			},
		});

		return new Response(stream.pipeThrough(transformStream), {
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
