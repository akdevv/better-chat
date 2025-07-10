import { Groq } from "groq-sdk";
import { getModelById } from "@/lib/ai/models";
import { AIError, AIStreamOptions } from "@/lib/types/ai";

export const createGroqStream = async (
	options: AIStreamOptions
): Promise<ReadableStream<Uint8Array>> => {
	const {
		messages,
		model,
		temperature = 0.7,
		maxTokens = 4000,
		signal,
	} = options;

	const modelInfo = getModelById(model);
	if (!modelInfo || modelInfo.provider !== "groq") {
		throw new Error(`Invalid Groq model: ${model}`);
	}

	const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

	return new ReadableStream({
		async start(controller) {
			try {
				// Check if already cancelled
				if (signal?.aborted) {
					controller.close();
					return;
				}

				const chatCompletion = await groq.chat.completions.create({
					messages: messages.map((msg) => ({
						role: msg.role.toLowerCase() as
							| "user"
							| "assistant"
							| "system",
						content: msg.content,
					})),
					model: modelInfo.id,
					stream: true,
					temperature,
					max_tokens: Math.min(maxTokens, modelInfo.maxOutputTokens),
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
			} catch (error: any) {
				if (error.name === "AbortError" || signal?.aborted) {
					controller.close();
				} else {
					console.error("Groq streaming error:", error);
					const aiError: AIError = new Error(
						`Groq API error: ${error.message}`
					) as AIError;
					aiError.provider = "groq";
					aiError.code = error.code;
					controller.error(aiError);
				}
			}
		},
		cancel() {
			console.error("Groq stream cancelled");
		},
	});
};
