import Anthropic from "@anthropic-ai/sdk";
import { getModelById } from "@/lib/ai/models";
import { AIStreamOptions } from "@/lib/types/ai";

export const createAnthropicStream = async (
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
	if (!modelInfo || modelInfo.provider !== "anthropic") {
		throw new Error(`Invalid Anthropic model: ${model}`);
	}

	const anthropic = new Anthropic({ apiKey });

	// Convert messages to Anthropic format
	const systemMessage = messages
		.filter((msg) => msg.role === "SYSTEM")
		.map((msg) => msg.content)
		.join("\n");

	const userMessages = messages
		.filter((msg) => msg.role === "USER" || msg.role === "ASSISTANT")
		.map((msg) =>
			msg.role === "USER"
				? { role: "user" as const, content: msg.content }
				: { role: "assistant" as const, content: msg.content }
		);

	return new ReadableStream({
		async start(controller) {
			try {
				// Check if already cancelled
				if (signal?.aborted) {
					controller.close();
					return;
				}

				const stream = await anthropic.messages.create({
					model: modelInfo.id,
					messages: userMessages,
					system: systemMessage,
					max_tokens: maxTokens,
					temperature,
					stream: true,
				});

				// Handle cancellation during streaming
				const onAbort = () => {
					controller.close();
				};
				signal?.addEventListener("abort", onAbort);

				for await (const chunk of stream) {
					if (signal?.aborted) break;

					if (
						chunk.type === "content_block_delta" &&
						chunk.delta.type === "text_delta"
					) {
						const content = chunk.delta.text || "";
						if (content) {
							controller.enqueue(
								new TextEncoder().encode(content)
							);
						}
					}
				}

				// Cleanup
				signal?.removeEventListener("abort", onAbort);
				controller.close();
			} catch (error) {
				const err = error as Error & { code?: string; name?: string };
				if (err.name === "AbortError" || signal?.aborted) {
					controller.close();
				}
			}
		},
	});
};
