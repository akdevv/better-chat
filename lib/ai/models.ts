export type ModelProvider = "groq" | "openai" | "google" | "anthropic";

export interface AIModel {
	id: string;
	name: string;
	provider: ModelProvider;
	isFree: boolean;
	isNew?: boolean;
	contextWindow: number;
	maxOutputTokens: number;
	maxMessageLength: number;
}

export const AI_MODELS: AIModel[] = [
	// Free models (Groq)
	{
		id: "deepseek-r1-distill-llama-70b",
		name: "DeepSeek R1",
		provider: "groq",
		isFree: true,
		contextWindow: 128000, // 128K context window
		maxOutputTokens: 8192,
		maxMessageLength: 32000,
	},
	{
		id: "meta-llama/llama-4-maverick-17b-128e-instruct",
		name: "Llama 4",
		provider: "groq",
		isFree: true,
		isNew: true,
		contextWindow: 128000,
		maxOutputTokens: 8192,
		maxMessageLength: 32000,
	},

	// Anthropic models (Paid)
	{
		id: "claude-opus-4-20250514",
		name: "Claude Opus 4",
		provider: "anthropic",
		isFree: false,
		contextWindow: 200000, // 200K context window
		maxOutputTokens: 32000, // 32K max output
		maxMessageLength: 50000,
	},
	{
		id: "claude-sonnet-4-20250514",
		name: "Claude Sonnet 4",
		provider: "anthropic",
		isFree: false,
		contextWindow: 200000, // 200K context window
		maxOutputTokens: 64000, // 64K max output
		maxMessageLength: 50000,
	},

	// Google models (Paid)
	{
		id: "gemini-2.5-pro",
		name: "Gemini 2.5 Pro",
		provider: "google",
		isFree: false,
		isNew: true,
		contextWindow: 1000000, // 1M context window
		maxOutputTokens: 64000, // 64K max output
		maxMessageLength: 200000,
	},
	{
		id: "gemini-2.5-flash",
		name: "Gemini 2.5 Flash",
		provider: "google",
		isFree: false,
		isNew: true,
		contextWindow: 1000000, // 1M context window
		maxOutputTokens: 64000, // 64K max output
		maxMessageLength: 200000,
	},

	// OpenAI models (Paid)
	{
		id: "gpt-4o",
		name: "GPT-4o",
		provider: "openai",
		isFree: false,
		contextWindow: 128000, // 128K context window
		maxOutputTokens: 16384, // 16K max output
		maxMessageLength: 32000,
	},
	{
		id: "gpt-4o-mini",
		name: "GPT-4o Mini",
		provider: "openai",
		isFree: false,
		contextWindow: 128000, // 128K context window
		maxOutputTokens: 16384, // 16K max output
		maxMessageLength: 32000,
	},
];

export const DEFAULT_MODEL = "deepseek-r1-distill-llama-70b";

// Helper functions
export const getModelById = (modelId: string) => {
	return AI_MODELS.find((model) => model.id === modelId);
};

export function groupModelsByProvider(): Record<ModelProvider, AIModel[]> {
	return AI_MODELS.reduce((acc, model) => {
		if (!acc[model.provider]) {
			acc[model.provider] = [];
		}
		acc[model.provider].push(model);
		return acc;
	}, {} as Record<ModelProvider, AIModel[]>);
}
