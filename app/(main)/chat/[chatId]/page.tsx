"use client";

import { useChatContext } from "@/contexts/chat-context";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { MdOutlineIosShare } from "react-icons/md";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
	const { chatState } = useChatContext();

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<header className="flex items-center justify-between px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex-1 min-w-0">
					<h1 className="font-bold truncate text-foreground">
						{"New Chat"}
					</h1>
				</div>
				<Button
					variant="outline"
					onClick={() => {}}
					className="flex items-center gap-2 cursor-pointer"
				>
					<MdOutlineIosShare className="h-4 w-4" />
					Share
				</Button>
			</header>

			{/* Messages area */}
			<div className="flex-1 overflow-y-auto">
				<ChatBubble
					messages={chatState.messages}
					isWaitingForResponse={chatState.isStreamingResponse}
				/>
			</div>

			{/* Input area */}
			<div className="sticky bottom-0 p-2 sm:p-3 bg-background">
				<ChatInput maxHeight={120} />
			</div>
		</div>
	);
}
