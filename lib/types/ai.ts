export interface AIMessage {
	role: "USER" | "ASSISTANT" | "SYSTEM";
	content: string;
}

export interface AIStreamOptions {
	messages: AIMessage[];
	model: string;
	temperature?: number;
	maxTokens?: number;
	signal?: AbortSignal;
	apiKey?: string;
}

export interface AIError extends Error {
	provider: string;
	code: string;
}
