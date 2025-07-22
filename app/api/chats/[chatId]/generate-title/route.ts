import { generateChatTitle } from "@/lib/ai/generate-title";
import { authenticateUser } from "@/lib/services/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
	req: NextRequest,
	{ params }: { params: { chatId: string } }
) {
	try {
		const { userId } = await authenticateUser();

		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { chatId } = await params;
		const { userMessage } = await req.json();

		const result = await generateChatTitle(chatId, userMessage);

		if (!result.success) {
			console.log("❌ Title generation failed:", result.error);
			return NextResponse.json(
				{
					success: false,
					error: result.error,
					chatId,
				},
				{ status: 200 }
			);
		}

		console.log("🎉 Title generation successful!");
		return NextResponse.json({
			success: true,
			title: result.title,
			chatId,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("💥 Unexpected error in generate-title API:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
