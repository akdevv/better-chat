"use client";

import { ChatInput } from "@/components/chat/chat-input";
import { useChatContext } from "@/contexts/chat-context";

export default function NewChatPage() {
	const { handleCreateChat } = useChatContext();

	return (
		<div className="flex flex-col p-2 sm:p-3 h-full w-full items-center justify-center gap-4">
			<h1 className="text-lg sm:text-2xl font-bold">
				Hi, how can I help you today?
			</h1>

			<ChatInput onSendMessage={handleCreateChat} maxHeight={240} />
		</div>
	);
}
