import { authenticateUser } from "@/lib/services/auth";
import { getApiKey } from "@/lib/services/api-keys";
import { NextRequest, NextResponse } from "next/server";
import { ApiKeyState } from "@/lib/types/settings";
import { decrypt } from "@/lib/encryption";

/**
 * GET /api/keys/[provider]/decrypt - Get decrypted API key for editing
 * This is a sensitive endpoint that should only be called when user is editing keys
 */
export async function GET(
	req: NextRequest,
	{ params }: { params: { provider: string } }
) {
	try {
		const { userId } = await authenticateUser();
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { provider } = await params;

		// Validate provider
		const validProviders = ["openai", "google", "anthropic"];
		if (!validProviders.includes(provider)) {
			return NextResponse.json(
				{ error: "Invalid provider" },
				{ status: 400 }
			);
		}

		const apiKey: ApiKeyState | null = await getApiKey(userId, provider);
		if (!apiKey) {
			return NextResponse.json(
				{ error: "API key not found" },
				{ status: 404 }
			);
		}

		const decryptedKey = await decrypt(apiKey.key || "", userId);

		return NextResponse.json({
			success: true,
			provider,
			apiKey: decryptedKey,
		});
	} catch (error) {
		console.error("Error decrypting API key:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
