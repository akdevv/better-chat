import { db } from "@/lib/prisma";
import { AI_MODELS } from "@/lib/ai/models";
import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/services/auth";

// GET /api/keys/status - Return status of all models
export async function GET() {
	try {
		const { userId } = await authenticateUser();

		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const apiKeys = await db.apiKey.findMany({
			where: { userId },
		});

		// calculate model availability
		const modelStatus = AI_MODELS.map((model) => {
			const isEnabled =
				model.isFree ||
				apiKeys.find(
					(key) => key.provider === model.provider && key.isValidated
				);

			return {
				id: model.id,
				name: model.name,
				provider: model.provider,
				isFree: model.isFree,
				isEnabled,
			};
		});

		return NextResponse.json(modelStatus, { status: 200 });
	} catch (error) {
		console.error("Error fetching model status:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
