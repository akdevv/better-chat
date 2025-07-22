import Groq from "groq-sdk";
import { db } from "@/lib/prisma";

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
});

interface TitleGenerationResult {
	success: boolean;
	title?: string;
	error?: string;
}

// System prompt for title generation
const TITLE_GENERATION_PROMPT = `You are a chat title generator. Your only job is to create short, descriptive titles for conversations.

Rules:
- Generate ONLY a title string (no quotes, no explanations, no additional text)
- Maximum 4-5 words
- Use Title Case (First Letter Of Each Word Capitalized)
- Be descriptive but concise
- Focus on the main topic or intent of the message
- Do not include "Chat", "Conversation", or "Discussion" in the title
- If the message is a greeting, focus on the likely topic or purpose

Examples:
User: "How do I bake chocolate chip cookies?"
Response: "Chocolate Chip Cookie Recipe"

User: "What's the weather like today?"
Response: "Weather Information Request"

User: "Can you help me with my JavaScript code?"
Response: "JavaScript Code Help"

User: "Hello, I need help with my resume"
Response: "Resume Writing Assistance"`;

const cleanAndValidateTitle = (rawTitle: string) => {
	if (!rawTitle || typeof rawTitle !== "string") {
		return null;
	}

	// Remove quotes, extra whitespace, and trim
	let cleaned = rawTitle
		.replace(/^["']|["']$/g, "")
		.replace(/\s+/g, " ")
		.trim();

	// Check if title is too long (more than 5 words)
	const words = cleaned.split(" ").filter((word) => word.length > 0);
	if (words.length > 5) {
		cleaned = words.slice(0, 5).join(" ");
	}

	// Check if title is too short (less than 1 word)
	if (words.length < 1) {
		return null;
	}

	return cleaned;
};

export const generateChatTitle = async (
	chatId: string,
	userMessage: string,
): Promise<TitleGenerationResult> => {
	try {
		// Validate inputs
		if (!chatId || !userMessage?.trim()) {
			return { success: false, error: "Invalid inputs" };
		}

		// Find chat
		const chat = await db.chat.findUnique({
			where: { id: chatId },
		});

		if (!chat) {
			return { success: false, error: "Chat not found" };
		}

		// Skip if chat is no longer "Untitled Chat"
		if (chat.title?.toLowerCase() !== "untitled chat") {
			return { success: false, error: "Chat title already updated" };
		}

		// Generate title using Groq
		const completion = await groq.chat.completions.create({
			messages: [
				{
					role: "system",
					content: TITLE_GENERATION_PROMPT,
				},
				{
					role: "user",
					content: userMessage.trim(),
				},
			],
			model: "gemma2-9b-it",
			temperature: 0.3,
			max_tokens: 20,
			stream: false,
		});

		const rawTitle = completion.choices[0]?.message?.content;

		if (!rawTitle) {
			return { success: false, error: "No title generated" };
		}

		// Clean and validate the title
		const cleanedTitle = cleanAndValidateTitle(rawTitle);

		if (!cleanedTitle) {
			return { success: false, error: "Title validation failed" };
		}

		// Update the chat title in the database
		const updatedChat = await db.chat.update({
			where: { id: chatId },
			data: { title: cleanedTitle },
		});

		return {
			success: true,
			title: updatedChat.title,
		};
	} catch (error) {
		console.error("❌ Error in generateChatTitle:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error generating title",
		};
	}
};
