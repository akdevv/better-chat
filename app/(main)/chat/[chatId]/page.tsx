import { ChatBubble } from "@/components/chat/chat-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { Header } from "@/components/chat/header";

export default function ChatPage() {
	return (
		<div className="flex flex-col h-full">
			<Header />

			{/* Messages area */}
			<div className="flex-1 overflow-y-auto">
				<ChatBubble />
			</div>

			{/* Input area */}
			<div className="sticky bottom-0 p-2 sm:p-3 bg-background">
				<ChatInput maxHeight={120} />
			</div>
		</div>
	);
}
