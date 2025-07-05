"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInput } from "@/components/chat/chat-input";

export default function NewChatPage() {
	const router = useRouter();
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [selectedModel, setSelectedModel] = useState("");

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;
		setIsLoading(true);

		try {
			const res = await fetch("/api/chats", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: selectedModel,
					initialMessage: input.trim(),
				}),
			});

			if (!res.ok) {
				throw new Error("Failed to create new chat");
			}

			const { chatId } = await res.json();
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
