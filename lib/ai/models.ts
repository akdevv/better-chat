export type ModelProvider = "groq" | "openai" | "anthropic";

export interface AIModel {
	id: string;
	name: string;
	provider: ModelProvider;
	isFree: boolean;
	isNew?: boolean;
	isPowerful?: boolean;
	description?: string;
}

export const AI_MODELS: AIModel[] = [
	// Free models (Groq)
	{
		id: "deepseek-r1-distill-llama-70b",
		name: "DeepSeek R1",
		provider: "groq",
		isFree: true,
		isPowerful: true,
		description: "Advanced reasoning model",
	},
	{
		id: "gemma2-9b-it",
		name: "Gemma 2",
		provider: "groq",
		isFree: true,
		description: "Google's efficient model",
	},
	{
		id: "qwen/qwen3-32b",
		name: "Qwen 3",
		provider: "groq",
		isFree: true,
		description: "Alibaba's multilingual model",
	},
	{
		id: "meta-llama/llama-4-maverick-17b-128e-instruct",
		name: "Llama 4",
		provider: "groq",
		isFree: true,
		isNew: true,
		description: "Meta's latest model",
	},

	// Anthropic models (Paid)
	{
		id: "claude-opus-4-20250514",
		name: "Claude Opus 4",
		provider: "anthropic",
		isFree: false,
		isPowerful: true,
		description: "Most capable Claude model",
	},
	{
		id: "claude-sonnet-4-20250514",
		name: "Claude Sonnet 4",
		provider: "anthropic",
		isFree: false,
		description: "Balanced Claude model",
	},

	// OpenAI models (Paid)
	{
		id: "o3",
		name: "O3",
		provider: "openai",
		isFree: false,
		isNew: true,
		isPowerful: true,
		description: "OpenAI's most advanced model",
	},
	{
		id: "o4-mini",
		name: "O4 Mini",
		provider: "openai",
		isFree: false,
		description: "Cost-effective reasoning",
	},
	{
		id: "o4-mini-high",
		name: "O4 Mini High",
		provider: "openai",
		isFree: false,
		description: "Enhanced O4 Mini",
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

