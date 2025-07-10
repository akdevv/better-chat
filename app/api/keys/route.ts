import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/services/auth";
import { getApiKeys } from "@/lib/services/api-keys";
import { verifyApiKey } from "@/lib/ai/verifier";
import { saveApiKey } from "@/lib/services/api-keys";
import { ApiKeyData } from "@/lib/types/api-keys";

// GET /api/keys - Get all API keys for the user
export async function GET() {
	try {
		const { userId } = await authenticateUser();
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const apiKeys: ApiKeyData[] = await getApiKeys(userId);
		return NextResponse.json({
			success: true,
			apiKeys,
		});
	} catch (error) {
		console.error("Error fetching API keys:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// POST /api/keys - Save a new API key
export async function POST(req: NextRequest) {
	try {
		const { userId } = await authenticateUser();
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const { provider, apiKey } = await req.json();

		// Validate params
		if (!provider || !apiKey) {
			return NextResponse.json(
				{ error: "Provider and API key are required" },
				{ status: 400 },
			);
		}

		// Validate provider
		const validProviders = ["openai", "google", "anthropic"];
		if (!validProviders.includes(provider.toLowerCase())) {
			return NextResponse.json(
				{ error: "Invalid provider" },
				{ status: 400 },
			);
		}

		const verification = await verifyApiKey(provider, apiKey);
		if (!verification.success) {
			return NextResponse.json(
				{ error: verification.error },
				{ status: 400 },
			);
		}

		// Save API key
		const savedKey: ApiKeyData = await saveApiKey(
			userId,
			provider.toLowerCase(),
			apiKey,
			true, // Mark as validated since we just verified it
		);

		return NextResponse.json({
			success: true,
			message: "API key saved and validated successfully",
			apiKey: savedKey,
			latency: verification.latency,
		});
	} catch (error) {
		console.error("Error saving API key:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
