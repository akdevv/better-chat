import { ApiKeyData } from "@/lib/types/api-keys";
import { authenticateUser } from "@/lib/services/auth";
import {
	getApiKeys,
	checkHasValidApiKey,
	deleteApiKey,
} from "@/lib/services/api-keys";
import { NextRequest, NextResponse } from "next/server";

// GET /api/keys/[provider] - Get API key status for a specific provider
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
		if (!validProviders.includes(provider.toLowerCase())) {
			return NextResponse.json(
				{ error: "Invalid provider" },
				{ status: 400 }
			);
		}

		const hasValidKey = await checkHasValidApiKey(userId, provider);

		// Get API keys details (without actual key)
		const apiKeys: ApiKeyData[] = await getApiKeys(userId);
		const providerKey: ApiKeyData | undefined = apiKeys.find(
			(key) => key.provider === provider
		);

		return NextResponse.json({
			success: true,
			provider,
			hasValidKey,
			apiKeyInfo: providerKey
				? {
						id: providerKey.id,
						isValidated: providerKey.isValidated,
						lastValidated: providerKey.lastValidated,
						createdAt: providerKey.createdAt,
						updatedAt: providerKey.updatedAt,
				  }
				: null,
		});
	} catch (error) {
		console.error("Error fetching API key status:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// DELETE /api/keys/[provider] - Delete API key for a specific provider
export async function DELETE(
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
		if (!validProviders.includes(provider.toLowerCase())) {
			return NextResponse.json(
				{ error: "Invalid provider" },
				{ status: 400 }
			);
		}

		const deletedKey = await deleteApiKey(userId, provider);
		if (!deletedKey) {
			return NextResponse.json(
				{ error: "API key not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: `${provider} API key deleted successfully`,
			provider,
		});
	} catch (error) {
		console.error("Error deleting API key:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
