import { db } from "@/lib/prisma";
import { authenticateUser } from "@/lib/services/auth";
import { NextRequest, NextResponse } from "next/server";

// POST /api/chats/[chatId]/messages/[messageId] - Link files to message
export async function POST(
	req: NextRequest,
	{ params }: { params: { messageId: string } }
) {
	try {
		const { userId } = await authenticateUser();
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { messageId } = await params;
		const { uploadedFileIds } = await req.json();

		if (
			!uploadedFileIds ||
			!Array.isArray(uploadedFileIds) ||
			uploadedFileIds.length === 0
		) {
			return NextResponse.json(
				{ error: "uploadedFileIds array is required" },
				{ status: 400 }
			);
		}

		console.log(
			`=== Linking ${uploadedFileIds.length} files to message ${messageId} ===`
		);

		// Verify message ownership through chat
		const message = await db.message.findFirst({
			where: {
				id: messageId,
				chat: {
					userId,
				},
			},
		});

		if (!message) {
			return NextResponse.json(
				{ error: "Message not found" },
				{ status: 404 }
			);
		}

		// Verify all files belong to the user
		const files = await db.uploadedFile.findMany({
			where: {
				id: {
					in: uploadedFileIds,
				},
				userId,
			},
		});

		if (files.length !== uploadedFileIds.length) {
			return NextResponse.json(
				{ error: "Some files not found or don't belong to user" },
				{ status: 400 }
			);
		}

		// Create the links
		const linkData = uploadedFileIds.map((fileId: string) => ({
			messageId,
			uploadedFileId: fileId,
		}));

		await db.messageFile.createMany({
			data: linkData,
			skipDuplicates: true, // Avoid errors if already linked
		});

		console.log(
			`Successfully linked ${uploadedFileIds.length} files to message`
		);

		return NextResponse.json({
			success: true,
			linkedFiles: uploadedFileIds.length,
			message: "Files linked to message successfully",
		});
	} catch (error) {
		console.error("Link files to message API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
