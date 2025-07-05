import { useSidebar } from "@/components/chat/chat-sidebar";

export const useAutoTitle = () => {
	const { updateChatTitle } = useSidebar();

	const generateAndUpdateTitle = async (
		chatId: string,
		userMessage: string
	) => {
		try {
			const res = await fetch(`/api/chats/${chatId}/generate-title`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userMessage }),
			});

			if (!res.ok) {
				throw new Error("Failed to generate title");
			}

			const data = await res.json();
			if (data.success && data.title) {
				updateChatTitle(chatId, data.title, true);
			}
		} catch (error) {
			console.error("Error generating title:", error);
		}
	};

	return { generateAndUpdateTitle };
};
