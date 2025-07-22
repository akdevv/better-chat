import { db } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { AIError, AIMessage } from "@/lib/types/ai";
import { AIModel, getModelById, ModelProvider } from "./models";
import { fetchFileContent, generateFileContextPrompt } from "./file-prompts";
import { FileData } from "@/lib/types/file";

import { createGroqStream } from "./providers/gorq";
import { createOpenAIStream } from "./providers/openai";
import { createAnthropicStream } from "./providers/anthropic";
import { createGoogleStream } from "./providers/google";

const MAX_CONTEXT_MESSAGES = 20;

interface UserApiKey {
	encryptedKey: string;
	lastValidated?: Date;
	isValidated: boolean;
}

// Get user's API keys from db
const getUserApiKeys = async (
	userId: string
): Promise<Record<string, UserApiKey>> => {
	try {
		const apiKeys = await db.apiKey.findMany({ where: { userId } });

		const keyMap: Record<string, UserApiKey> = {};
		for (const key of apiKeys) {
			keyMap[key.provider] = {
				encryptedKey: key.encryptedKey,
				lastValidated: key.lastValidated ?? undefined,
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
	} catch {
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

// Get file data from database with content
const getFilesData = async (fileIds: string[]): Promise<FileData[]> => {
	if (fileIds.length === 0) return [];

	try {
		const files = await db.uploadedFile.findMany({
			where: { id: { in: fileIds } },
			select: {
				id: true,
				originalName: true,
				mimeType: true,
				size: true,
				uploadThingUrl: true,
			},
		});

		// Fetch file content for each file
		const filesWithContent = await Promise.all(
			files.map(async (file) => {
				const content = await fetchFileContent(
					file.uploadThingUrl,
					file.mimeType,
					file.size
				);

				return {
					id: file.id,
					name: file.originalName,
					type: file.mimeType,
					size: file.size,
					url: file.uploadThingUrl,
					content: content,
				} as FileData;
			})
		);

		return filesWithContent;
	} catch (error) {
		console.error("Error fetching file data:", error);
		return [];
	}
};

// Preprocess messages with context
const prepareMessages = async (
	model: AIModel,
	messages: AIMessage[],
	currentMessage: string,
	fileIds: string[] = []
): Promise<AIMessage[]> => {
	const files = await getFilesData(fileIds);

	validateChatInput(model, currentMessage, messages);

	// Generate file context prompt if files are attached
	const fileContextPrompt =
		files.length > 0 ? generateFileContextPrompt(files) : "";

	// No history, just add current message
	if (messages.length === 1) {
		const finalMessages: AIMessage[] = [];

		// Add file context as system message if files are present
		if (fileContextPrompt) {
			finalMessages.push({ role: "SYSTEM", content: fileContextPrompt });
		}

		finalMessages.push({ role: "USER", content: currentMessage });
		return finalMessages;
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

	// Add file context tokens if present
	if (fileContextPrompt) {
		totalTokens += countTokens(fileContextPrompt);
	}

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
	let contextPrompt = "";
	if (trimmedMessages.length > 0) {
		contextPrompt = `Previous conversation history for context:

${trimmedMessages
	.map(
		(msg) => `${msg.role === "USER" ? "User" : "Assistant"}: ${msg.content}`
	)
	.join("\n\n")}

---

`;
	}

	// Add file content to the current message if files are attached
	if (files.length > 0) {
		contextPrompt += `Attached files:\n`;
		files.forEach((file, index) => {
			contextPrompt += `\nFile ${index + 1}: ${file.name} (${
				file.type
			})\n`;
			if (file.content) {
				if (
					file.content.startsWith("[IMAGE:") ||
					file.content.startsWith("[FILE:")
				) {
					contextPrompt += `${file.content}\n`;
				} else {
					contextPrompt += `Content:\n\`\`\`\n${file.content}\n\`\`\`\n`;
				}
			} else {
				contextPrompt += `[Content could not be loaded]\n`;
			}
		});
		contextPrompt += `\n---\n\n`;
	}

	contextPrompt += `Current message (please respond to this):\n${currentMessage}`;

	const finalMessages: AIMessage[] = [];

	// Add existing system messages
	finalMessages.push(...systemMessages);

	// Add file context as system message if files are present
	if (fileContextPrompt) {
		finalMessages.push({ role: "SYSTEM", content: fileContextPrompt });
	}

	// Add user message with context and files
	finalMessages.push({ role: "USER", content: contextPrompt });

	return finalMessages;
};

// MAIN FUNCTIONS
export const sendMessageToAI = async (
	message: string,
	modelId: string,
	userId: string,
	options: {
		fileIds?: string[];
		signal?: AbortSignal;
	}
): Promise<ReadableStream<Uint8Array>> => {
	const { fileIds = [], signal } = options;

	const model = getModelById(modelId);
	if (!model) throw new Error(`Model ${modelId} not found`);

	const apiKey = await verifyApiKey(modelId, userId);

	const finalMessages = await prepareMessages(model, [], message, fileIds);

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
		fileIds?: string[];
		signal?: AbortSignal;
	} = {}
): Promise<ReadableStream<Uint8Array>> => {
	const { temperature, maxTokens, fileIds = [], signal } = options;

	const model = getModelById(modelId);
	if (!model) throw new Error(`Model ${modelId} not found`);

	const apiKey = await verifyApiKey(modelId, userId);

	const finalMessages = await prepareMessages(
		model,
		messages,
		currentMessage,
		fileIds
	);

	const stream = getStreamFunction(model.provider);
	return stream({
		messages: finalMessages,
		model: modelId,
		apiKey,
		temperature,
		maxTokens,
		signal,
	});
};
