import { useCallback } from "react";
import { useSidebar } from "@/components/sidebar";
import { SidebarChat } from "@/lib/types/sidebar";

export const useChatCreation = () => {
	const { addNewChat, generateAiTitle } = useSidebar();

	const createNewChat = useCallback(
		async (model: string, initialMessage: string): Promise<string> => {
			try {
				const res = await fetch("/api/chats", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						model,
						initialMessage,
					}),
				});

				console.log("res of chat creation", res);

				if (!res.ok) {
					throw new Error("Failed to create new chat");
				}

				const { chatId } = await res.json();

				console.log("chatId", chatId);

				// set the new chat to sidebar optimistically
				const sidebarChat: SidebarChat = {
					id: chatId,
					title: "Untitled Chat",
					isStarred: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				console.log("sidebarChat", sidebarChat);

				addNewChat(sidebarChat);

				console.log("newChat.id", chatId);

				return chatId;
			} catch (error) {
				console.error("Error creating new chat: ", error);
				throw error;
			}
		},
		[addNewChat]
	);

	const handleGenerateAiTitle = useCallback(
		async (chatId: string, userMessage: string) => {
			try {
				console.log("trying to generate ai title");
				await generateAiTitle(chatId, userMessage);
			} catch (error) {
				console.error("Error generating AI title: ", error);
			}
		},
		[generateAiTitle]
	);

	return { createNewChat, handleGenerateAiTitle };
};
