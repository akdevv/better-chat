"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInput } from "@/components/chat/chat-input";
import { AI_MODELS } from "@/lib/ai/models";
import { useChatCreation } from "@/hooks/use-chat-creation";

export default function NewChatPage() {
	const router = useRouter();
	const { createNewChat, handleGenerateAiTitle } = useChatCreation();

	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		setIsLoading(true);

		try {
			const chatId = await createNewChat(selectedModel, input.trim());
			console.log("chatId", chatId);
			handleGenerateAiTitle(chatId, input.trim());
			router.push(`/chat/${chatId}`);
		} catch (error) {
			console.error("Error creating chat: ", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full w-full items-center justify-center gap-4">
			<h1 className="text-2xl font-bold">
				Hi, what can I help you with?
			</h1>
			<ChatInput
				input={input}
				setInput={setInput}
				isLoading={isLoading}
				selectedModel={selectedModel}
				setSelectedModel={setSelectedModel}
				onSendMessage={handleSendMessage}
			/>
		</div>
	);
}
