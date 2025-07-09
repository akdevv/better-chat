import OpenAI from "openai";
import { Anthropic } from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

const TEST_MESSAGE = "Hi";
const TIMEOUT_MS = 10000; // 10 seconds

export interface VerificationResult {
	success: boolean;
	error?: string;
	latency?: number;
}

// Verify OpenAI API key
async function verifyOpenAIKey(apiKey: string): Promise<VerificationResult> {
	const startTime = Date.now();

	try {
		const openai = new OpenAI({ apiKey, timeout: TIMEOUT_MS });
		const res = await openai.chat.completions.create({
			model: "gpt-4.1-nano-2025-04-14",
			messages: [{ role: "user", content: TEST_MESSAGE }],
			max_tokens: 50,
		});

		if (res.choices && res.choices.length > 0) {
			return {
				success: true,
				latency: Date.now() - startTime,
			};
		} else {
			return {
				success: false,
				error: "No response from OpenAI",
			};
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

// Verify Anthropic API key
async function verifyAnthropicKey(apiKey: string): Promise<VerificationResult> {
	const startTime = Date.now();

	try {
		const anthropic = new Anthropic({ apiKey, timeout: TIMEOUT_MS });

		const res = await anthropic.messages.create({
			model: "claude-3-5-haiku-latest",
			max_tokens: 50,
			messages: [
				{
					role: "user",
					content: TEST_MESSAGE,
				},
			],
		});

		if (res.content && res.content.length > 0) {
			return {
				success: true,
				latency: Date.now() - startTime,
			};
		} else {
			return {
				success: false,
				error: "Invalid API key",
			};
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

// Verify Google API key
async function verifyGoogleKey(apiKey: string): Promise<VerificationResult> {
	const startTime = Date.now();

	try {
		const google = new GoogleGenAI({ apiKey });
		const res = await google.models.generateContent({
			model: "gemini-2.0-flash",
			contents: TEST_MESSAGE,
			config: {
				maxOutputTokens: 50,
				abortSignal: AbortSignal.timeout(TIMEOUT_MS),
			},
		});

		if (res.text) {
			return {
				success: true,
				latency: Date.now() - startTime,
			};
		} else
			return {
				success: false,
				error: "Invalid API key",
			};
	} catch (error) {
		let errorMessage = "Unknown error";

		if (error instanceof Error) {
			try {
				const errorData = JSON.parse(error.message);
				if (errorData.error && errorData.error.message) {
					errorMessage = errorData.error.message;
				} else {
					errorMessage = error.message;
				}
			} catch {
				errorMessage = error.message;
			}
		}

		return {
			success: false,
			error: errorMessage,
		};
	}
}

export const verifyApiKey = async (
	provider: string,
	apiKey: string,
): Promise<VerificationResult> => {
	if (!apiKey || !apiKey.trim()) {
		return {
			success: false,
			error: "API key is required",
		};
	}

	switch (provider.toLowerCase()) {
		case "openai":
			return verifyOpenAIKey(apiKey);
		case "anthropic":
			return verifyAnthropicKey(apiKey);
		case "google":
			return verifyGoogleKey(apiKey);
		default:
			return {
				success: false,
				error: `Unsupported provider: ${provider}`,
			};
	}
};

export const verifyMultipleApiKeys = async (
	keys: Array<{ provider: string; apiKey: string }>,
): Promise<Record<string, VerificationResult>> => {
	const results: Record<string, VerificationResult> = {};

	const verificationPromises = keys.map(async ({ provider, apiKey }) => {
		const result = await verifyApiKey(provider, apiKey);
		results[apiKey] = result;
	});

	await Promise.all(verificationPromises);

	return results;
};
