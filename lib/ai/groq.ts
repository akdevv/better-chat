import { Groq } from "groq-sdk";
import { AI_MODELS } from "./models";

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
});

export const callGroq = async (message: string, model: string) => {
	const selectedModel = AI_MODELS.find((m) => m.id === model);

	const modelToUse =
		selectedModel && selectedModel.provider === "groq"
			? selectedModel.id
			: "deepseek-r1-distill-llama-70b";

	const stream = new ReadableStream({
		async start(controller) {
			try {
				const chatCompletion = await groq.chat.completions.create({
					messages: [{ role: "user", content: message }],
					model: modelToUse,
					stream: true,
					temperature: 0.7,
					max_tokens: 4000,
				});

				for await (const chunk of chatCompletion) {
					const content = chunk.choices[0]?.delta?.content || "";
					if (content) {
						controller.enqueue(new TextEncoder().encode(content));
					}
				}
				controller.close();
			} catch (error) {
				console.error("Groq streaming error:", error);
				controller.error(error);
			}
		},
	});

	return stream;
};
