import { db } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { ApiKeyData, ApiKeyState } from "@/lib/types/api-keys";

const formatApiKey = (key: any): ApiKeyData => {
	return {
		id: key.id,
		provider: key.provider as "openai" | "google" | "anthropic",
		isValidated: key.isValidated,
		lastValidated: key.lastValidated || undefined,
		createdAt: key.createdAt,
		updatedAt: key.updatedAt,
	};
};

// Get API key for a user and provider
export const getApiKey = async (
	userId: string,
	provider: string,
): Promise<ApiKeyState | null> => {
	try {
		const apiKey = await db.apiKey.findFirst({
			where: {
				userId,
				provider: provider as "openai" | "google" | "anthropic",
			},
		});

		return apiKey
			? {
					id: apiKey.id,
					provider: apiKey.provider as
						| "openai"
						| "google"
						| "anthropic",
					key: apiKey.encryptedKey,
					isEditing: false,
					status: "none",
					isLoading: false,
					isVerifying: false,
					isDeleting: false,
					isSaving: false,
				}
			: null;
	} catch (error) {
		console.error("Error fetching API key:", error);
		throw new Error("Failed to fetch API key");
	}
};

// Get all API keys for a user
export const getApiKeys = async (userId: string): Promise<ApiKeyData[]> => {
	try {
		const apiKeys = await db.apiKey.findMany({
			where: { userId },
		});
		return apiKeys.map((key) => formatApiKey(key));
	} catch (error) {
		console.error("Error fetching API keys:", error);
		throw new Error("Failed to fetch API keys");
	}
};

// Save or update an API key
export const saveApiKey = async (
	userId: string,
	provider: string,
	apiKey: string,
	isValidated: boolean = false,
): Promise<ApiKeyData> => {
	try {
		const user = await db.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new Error(`User with ID ${userId} not found`);
		}

		const encryptedKey = await encrypt(apiKey, userId);
		const existingKey = await db.apiKey.findFirst({
			where: {
				userId,
				provider: provider as "openai" | "google" | "anthropic",
			},
		});

		if (existingKey) {
			const updatedKey = await db.apiKey.update({
				where: { id: existingKey.id },
				data: { encryptedKey, isValidated, lastValidated: new Date() },
			});
			return formatApiKey(updatedKey);
		} else {
			const createdKey = await db.apiKey.create({
				data: {
					userId,
					provider: provider as "openai" | "google" | "anthropic",
					encryptedKey,
					isValidated,
					lastValidated: new Date(),
				},
			});
			return formatApiKey(createdKey);
		}
	} catch (error) {
		console.error("Error saving API key:", error);
		throw new Error("Failed to save API key");
	}
};

// Check if user has valid API key for provider
export const checkHasValidApiKey = async (
	userId: string,
	provider: string,
): Promise<boolean> => {
	try {
		const user = await db.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new Error(`User with ID ${userId} not found`);
		}

		const apiKey = await db.apiKey.findFirst({
			where: {
				userId,
				provider: provider as "openai" | "google" | "anthropic",
				isValidated: true,
			},
		});

		return apiKey ? true : false;
	} catch (error) {
		console.error("Error checking API key:", error);
		throw new Error("Failed to check API key");
	}
};

// Delete API key for a user and provider
export const deleteApiKey = async (
	userId: string,
	provider: string,
): Promise<boolean> => {
	try {
		const user = await db.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new Error(`User with ID ${userId} not found`);
		}

		const deletedKey = await db.apiKey.deleteMany({
			where: {
				userId,
				provider: provider as "openai" | "google" | "anthropic",
			},
		});

		return deletedKey.count > 0;
	} catch (error) {
		console.error("Error deleting API key:", error);
		throw new Error("Failed to delete API key");
	}
};
