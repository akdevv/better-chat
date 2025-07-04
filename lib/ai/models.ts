export type ModelProvider = "groq" | "openai" | "anthropic";

export interface AIModel {
	id: string;
	name: string;
	provider: ModelProvider;
	isFree: boolean;
}

export const AI_MODELS: AIModel[] = [
	{
		id: "deepseek-r1-distill-llama-70b",
		name: "DeepSeek R1",
		provider: "groq",
		isFree: true,
	},
	{
		id: "gemma2-9b-it",
		name: "Gemma 2",
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
	},
];
