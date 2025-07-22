import OpenAI from "openai";
import { getModelById } from "@/lib/ai/models";
import { AIError, AIStreamOptions } from "@/lib/types/ai";

export const createOpenAIStream = async (
	options: AIStreamOptions
): Promise<ReadableStream<Uint8Array>> => {
	const {
		messages,
		model,
		temperature = 0.7,
		maxTokens = 4000,
		signal,
		apiKey,
	} = options;

	const modelInfo = getModelById(model);
	if (!modelInfo || modelInfo.provider !== "openai") {
		throw new Error(`Invalid OpenAI model: ${model}`);
	}

	const openai = new OpenAI({ apiKey });

	return new ReadableStream({
		async start(controller) {
			try {
				// Check if already cancelled
				if (signal?.aborted) {
					controller.close();
					return;
				}

				const chatCompletion = await openai.chat.completions.create({
					model: modelInfo.id,
					messages: messages.map((msg) => ({
						role: msg.role.toLowerCase() as
							| "user"
							| "assistant"
							| "system",
						content: msg.content,
					})),
					stream: true,
					temperature,
					max_tokens: maxTokens,
				});

				// Handle cancellation during streaming
				const onAbort = () => {
					controller.close();
				};
				signal?.addEventListener("abort", onAbort);

				for await (const chunk of chatCompletion) {
					// Check if cancelled during iteration
					if (signal?.aborted) {
						break;
					}

					const content = chunk.choices[0]?.delta?.content || "";
					if (content) {
						controller.enqueue(new TextEncoder().encode(content));
					}
				}

				// Cleanup
				signal?.removeEventListener("abort", onAbort);
				controller.close();
			} catch (error) {
				const err = error as Error & { code?: string; name?: string };
				if (err.name === "AbortError" || signal?.aborted) {
					controller.close();
				} else {
					console.error("OpenAI streaming error:", error);
					const aiError: AIError = new Error(
						`OpenAI API error: ${err.message ?? "Unknown error"}`
					) as AIError;
					aiError.provider = "openai";
					aiError.code = err.code ?? "unknown";
					controller.error(aiError);
				}
			}
		},
		cancel() {
			console.error("OpenAI stream cancelled");
		},
	});
};
