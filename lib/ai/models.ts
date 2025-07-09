export type ModelProvider = "groq" | "openai" | "google" | "anthropic";

export interface AIModel {
	id: string;
	name: string;
	provider: ModelProvider;
	isFree: boolean;
	isNew?: boolean;
}

export const AI_MODELS: AIModel[] = [
	// Free models (Groq)
	{
		id: "deepseek-r1-distill-llama-70b",
		name: "DeepSeek R1",
		provider: "groq",
		isFree: true,
	},
	{
		id: "qwen/qwen3-32b",
		name: "Qwen 3",
		provider: "groq",
		isFree: true,
	},
	{
		id: "meta-llama/llama-4-maverick-17b-128e-instruct",
		name: "Llama 4",
		provider: "groq",
		isFree: true,
		isNew: true,
	},

	// Anthropic models (Paid)
	{
		id: "claude-opus-4-20250514",
		name: "Claude Opus 4",
		provider: "anthropic",
		isFree: false,
	},
	{
		id: "claude-sonnet-4-20250514",
		name: "Claude Sonnet 4",
		provider: "anthropic",
		isFree: false,
	},

	// Google models (Paid)
	{
		id: "gemma2-9b-it",
		name: "Gemma 2",
		provider: "google",
		isFree: false,
	},

	// OpenAI models (Paid)
	{
		id: "o3",
		name: "O3",
		provider: "openai",
		isFree: false,
		isNew: true,
	},
	{
		id: "o4-mini",
		name: "O4 Mini",
		provider: "openai",
		isFree: false,
	},
	{
		id: "o4-mini-high",
		name: "O4 Mini High",
		provider: "openai",
		isFree: false,
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
