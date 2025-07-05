import { Groq } from "groq-sdk";

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = `You are a title generator. Your ONLY job is to create short chat titles.

RULES:
- Maximum 4 words
- No quotes, no punctuation, no special characters
- Capitalize like a title (Title Case)
- Be descriptive but concise
- ONLY respond with the title, nothing else
- Do not add explanations, greetings, or extra text

Examples:
User: "How do I bake a chocolate cake?"
Response: Chocolate Cake Recipe

User: "What's the weather like in Paris?"
Response: Paris Weather Check

User: "Can you help me with my Python code?"
Response: Python Code Help`;

export const generateAIChatTitle = async (userMessage: string) => {
	try {
		if (!process.env.GROQ_API_KEY) {
			console.warn("GROQ_API_KEY not configured");
			return "Untitled Chat";
		}

		const res = await groq.chat.completions.create({
			model: "gemma2-9b-it",
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{ role: "user", content: userMessage },
			],
			temperature: 0.7,
			max_tokens: 50,
			stream: false,
		});

		const title = res.choices[0].message.content?.trim();
		if (!title) {
			console.warn("No title generated");
			return "Untitled Chat";
		}

		const cleanedTitle = title
			.replace(/['".,!?;:]/g, "") // Remove punctuation
			.split(" ")
			.slice(0, 4) // Max 4 words
			.filter((word) => word.length > 0) // Remove empty words
			.map(
				(word) =>
					word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
			) // Title case
			.join(" ")
			.trim();

		return cleanedTitle || "Untitled Chat";
	} catch (error) {
		console.error("Error generating AI chat title:", error);
		return "Untitled Chat";
	}
};
