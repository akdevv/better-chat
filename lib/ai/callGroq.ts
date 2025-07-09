import { Groq } from "groq-sdk";
import { AI_MODELS } from "./models";

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
});

export const callGroq = async (
	message: string,
	model: string,
	signal?: AbortSignal,
) => {
	const selectedModel = AI_MODELS.find((m) => m.id === model);

	const modelToUse =
		selectedModel && selectedModel.provider === "groq"
			? selectedModel.id
			: "deepseek-r1-distill-llama-70b";

	return new ReadableStream({
		async start(controller) {
			try {
				// Check if already cancelled
				if (signal?.aborted) {
					controller.close();
					return;
				}

				const chatCompletion = await groq.chat.completions.create({
					messages: [{ role: "user", content: message }],
					model: modelToUse,
					stream: true,
					temperature: 0.7,
					max_tokens: 4000,
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
					controller.error(error);
				}
			}
		},
		cancel() {
			console.error("Groq stream cancelled");
		},
	});
};
