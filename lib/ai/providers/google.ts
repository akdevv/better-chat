import { GoogleGenAI } from "@google/genai";
import { getModelById } from "@/lib/ai/models";
import { AIError, AIStreamOptions } from "@/lib/types/ai";

export const createGoogleStream = async (
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
	if (!modelInfo || modelInfo.provider !== "google") {
		throw new Error(`Invalid Google model: ${model}`);
	}

	const google = new GoogleGenAI({ apiKey });

	// Transform messages to Google's expected format
	const formattedMessages = messages.map((message) => ({
		role:
			message.role === "USER"
				? "user"
				: message.role === "ASSISTANT"
				? "model"
				: "user",
		parts: [{ text: message.content }],
	}));

	return new ReadableStream({
		async start(controller) {
			try {
				// Check if already cancelled
				if (signal?.aborted) {
					controller.close();
					return;
				}

				const stream = await google.models.generateContentStream({
					model: modelInfo.id,
					contents: formattedMessages,
					config: {
						maxOutputTokens: maxTokens,
						temperature,
						abortSignal: signal,
					},
				});

				// Handle cancellation during streaming
				const onAbort = () => {
					controller.close();
				};
				signal?.addEventListener("abort", onAbort);

				for await (const chunk of stream) {
					if (signal?.aborted) break;

					const content = chunk.text || "";
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
					console.error("Google streaming error:", error);
					const aiError: AIError = new Error(
						`Google API error: ${error.message}`
					) as AIError;
					aiError.provider = "google";
					aiError.code = error.code;
					controller.error(aiError);
				}
			}
		},
		cancel() {
			console.error("Google stream cancelled");
		},
	});
};
