import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { renameChat, toggleStar, deleteChat } from "@/lib/services/chat";
import { authenticateUser } from "@/lib/services/auth";

// Validation schemas
const patchSchema = z.discriminatedUnion("action", [
	z.object({
		action: z.literal("rename"),
		title: z.string().min(1).max(100).trim(),
	}),
	z.object({
		action: z.literal("toggle_star"),
	}),
]);

// PATCH /api/chats/[chatId] - Update a chat (rename or star)
export async function PATCH(
	req: NextRequest,
	{ params }: { params: { chatId: string } }
) {
	try {
		const { error, userId } = await authenticateUser();
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const { chatId } = params;
		const body = await req.json();

		// Validate request body
		const validation = patchSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Invalid request",
					details: validation.error.errors,
				},
				{ status: 400 }
			);
		}

		const data = validation.data;
		let result;

		if (data.action === "rename") {
			result = await renameChat(chatId, userId!, data.title);
		} else {
			result = await toggleStar(chatId, userId!);
		}

		if (result.error) {
			return NextResponse.json({ error: result.error }, { status: 400 });
		}

		return NextResponse.json(result.chat);
	} catch (error) {
		console.error("Error updating chat:", error);
		return NextResponse.json(
			{ error: "Failed to update chat." },
			{ status: 500 }
		);
	}
}

// DELETE /api/chats/[chatId] - Delete a chat
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { chatId: string } }
) {
	try {
		const { error, userId } = await authenticateUser();
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const { chatId } = params;
		const result = await deleteChat(chatId, userId!);

		if (result.error) {
			return NextResponse.json({ error: result.error }, { status: 400 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting chat:", error);
		return NextResponse.json(
			{ error: "Failed to delete chat" },
			{ status: 500 }
		);
	}
}
