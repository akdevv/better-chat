"use client";

import { ChatInput } from "@/components/chat/chat-input";

export default function NewChatPage() {
	return (
		<div className="flex flex-col h-full w-full items-center justify-center gap-4">
			<h1 className="text-2xl font-bold">
				Hi, what can I help you with?
			</h1>
			<ChatInput
				input=""
				setInput={() => {}}
				isLoading={false}
				selectedModel=""
				setSelectedModel={() => {}}
				onSendMessage={() => {}}
			/>
		</div>
	);
}
