import { db } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { Message } from "@/lib/types/chat";
import { AIError, AIMessage } from "@/lib/types/ai";
import { AIModel, getModelById, ModelProvider } from "./models";

import { createGroqStream } from "./providers/gorq";
import { createOpenAIStream } from "./providers/openai";
import { createAnthropicStream } from "./providers/anthropic";
import { createGoogleStream } from "./providers/google";

const MAX_CONTEXT_MESSAGES = 20;

// Get user's API keys from db
const getUserApiKeys = async (userId: string): Promise<Record<string, any>> => {
	try {
		const apiKeys = await db.apiKey.findMany({ where: { userId } });

		const keyMap: Record<string, any> = {};
		for (const key of apiKeys) {
			keyMap[key.provider] = {
				encryptedKey: key.encryptedKey,
				lastValidated: key.lastValidated,
				isValidated: key.isValidated,
			};
		}

		return keyMap;
	} catch (error) {
		console.error("Error fetching user API keys:", error);
		return {};
	}
};

// Get the stream function for a provider
const getStreamFunction = (provider: ModelProvider) => {
	switch (provider) {
		case "groq":
			return createGroqStream;
		case "openai":
			return createOpenAIStream;
		case "anthropic":
			return createAnthropicStream;
		case "google":
			return createGoogleStream;
		default:
			throw new Error(`Unsupported provider: ${provider}`);
	}
};

// Verify API key for model provider
const verifyApiKey = async (modelId: string, userId: string) => {
	const model = getModelById(modelId);
	if (!model) {
		const error = new Error(`Model ${modelId} not found`) as AIError;
		error.code = "MODEL_NOT_FOUND";
		error.provider = "validation";
		throw error;
	}

	// Groq doesn't require API key validation
	if (model.provider === "groq") return undefined;

	// Get user's API keys
	const apiKeys = await getUserApiKeys(userId);
	const providerKey = apiKeys[model.provider];

	if (!providerKey) {
		const error = new Error(
			`Please add your ${model.provider} API key.`
		) as AIError;
		error.provider = model.provider;
		error.code = "NO_API_KEY";
		throw error;
	}

	try {
		return decrypt(providerKey.encryptedKey, userId);
	} catch (error) {
		const decryptError = new Error(
			`Failed to decrypt ${model.provider} API key.`
		) as AIError;
		decryptError.provider = model.provider;
		decryptError.code = "INVALID_API_KEY";
		throw decryptError;
	}
};

const countTokens = (message: string) => {
	return Math.ceil(message.length / 4);
};

// Validate message length and context window
const validateChatInput = (
	model: AIModel,
	currentMessage: string,
	messages: AIMessage[] = []
) => {
	if (currentMessage.length > model.maxMessageLength) {
		const error = new Error("Your message is too long.") as AIError;
		error.code = "MESSAGE_TOO_LONG";
		error.provider = "validation";
		throw error;
	}

	// Calculate token count (1 token = 4 chars)
	const totalTokens =
		messages.reduce((acc, msg) => acc + countTokens(msg.content), 0) +
		countTokens(currentMessage);
	if (totalTokens > model.contextWindow) {
		const error = new Error(
			"This conversation has too much context. Please start a new chat to continue."
		) as AIError;
		error.code = "CONTEXT_TOO_LONG";
		error.provider = "validation";
		throw error;
	}
};

// Preprocess messages with context
const prepareMessages = (
	model: AIModel,
	messages: AIMessage[],
	currentMessage: string
): AIMessage[] => {
	validateChatInput(model, currentMessage, messages);

	// No history, just add current message
	if (messages.length === 0) {
		return [{ role: "USER", content: currentMessage }];
	}

	// Separate out system messages
	const systemMessages = messages.filter((msg) => msg.role === "SYSTEM");
	const conversationMessages = messages.filter(
		(msg) => msg.role !== "SYSTEM"
	);

	// Smart context management
	let totalTokens = countTokens(currentMessage);
	totalTokens += systemMessages.reduce(
		(acc, msg) => acc + countTokens(msg.content),
		0
	);

	const trimmedMessages: AIMessage[] = [];
	const maxTokens = Math.floor(model.contextWindow * 0.8); // Reserve 20% for response

	for (let i = conversationMessages.length - 1; i >= 0; i--) {
		const msgTokens = countTokens(conversationMessages[i].content);
		if (
			totalTokens + msgTokens > maxTokens ||
			trimmedMessages.length > MAX_CONTEXT_MESSAGES
		) {
			break;
		}

		trimmedMessages.unshift(conversationMessages[i]);
		totalTokens += msgTokens;
	}

	// Create context aware prompt
	const contextPrompt =
		trimmedMessages.length > 0
			? `Previous conversation history for context:

${trimmedMessages
	.map(
		(msg) => `${msg.role === "USER" ? "User" : "Assistant"}: ${msg.content}`
	)
	.join("\n\n")}

---

Current message (please respond to this):
${currentMessage}`
			: currentMessage;

	return [...systemMessages, { role: "USER", content: contextPrompt }];
};

// MAIN FUNCTIONS
export const sendMessageToAI = async (
	message: string,
	modelId: string,
	userId: string,
	signal?: AbortSignal
): Promise<ReadableStream<Uint8Array>> => {
	const model = getModelById(modelId);
	if (!model) throw new Error(`Model ${modelId} not found`);

	const apiKey = await verifyApiKey(modelId, userId);

	const finalMessages = prepareMessages(model, [], message);

	const stream = getStreamFunction(model.provider);
	return stream({
		messages: finalMessages,
		model: modelId,
		apiKey,
		signal,
	});
};

export const sendMessageToAIWithHistory = async (
	messages: AIMessage[],
	currentMessage: string,
	modelId: string,
	userId: string,
	options: {
		temperature?: number;
		maxTokens?: number;
		signal?: AbortSignal;
	} = {}
): Promise<ReadableStream<Uint8Array>> => {
	const model = getModelById(modelId);
	if (!model) throw new Error(`Model ${modelId} not found`);

	const apiKey = await verifyApiKey(modelId, userId);

	const finalMessages = prepareMessages(model, messages, currentMessage);

	const stream = getStreamFunction(model.provider);
	return stream({
		messages: finalMessages,
		model: modelId,
		apiKey,
		...options,
	});
};
