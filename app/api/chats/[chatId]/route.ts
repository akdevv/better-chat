import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { deleteChat, renameChat, toggleStar } from "@/lib/services/chat";

// DELETE /api/chats/[chatId] - Delete a chat
export async function DELETE(
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

		const result = await deleteChat(chatId, session.user.id);
		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		console.error("Error deleting chat: ", error);
		return NextResponse.json(
			{ error: "Failed to delete chat" },
			{ status: 500 }
		);
	}
}

// PATCH /api/chats/[chatId] - Update a chat (rename or star)
export async function PATCH(
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

		const { action, title } = await req.json();
		if (!action || !["rename", "toggle_star"].includes(action)) {
			return NextResponse.json(
				{ error: "Invalid action. Must be 'rename' or 'toggle_star'" },
				{ status: 400 }
			);
		}

		let result;
		if (action === "rename") {
			if (!title) {
				return NextResponse.json(
					{ error: "Title is required for rename" },
					{ status: 400 }
				);
			}

			result = await renameChat(chatId, session.user.id, title);
		} else if (action === "toggle_star") {
			result = await toggleStar(chatId, session.user.id);
		}

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		console.error("Error updating chat: ", error);
		return NextResponse.json(
			{ error: "Failed to update chat" },
			{ status: 500 }
		);
	}
}
