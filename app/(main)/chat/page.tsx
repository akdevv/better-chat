import { ChatInput } from "@/components/chat/chat-input";

export default function NewChatPage() {
	return (
		<div className="flex flex-col p-2 sm:p-3 h-full w-full items-center justify-center gap-4">
			<h1 className="text-lg sm:text-2xl font-bold">
				Hi, how can I help you today?
			</h1>

			<ChatInput maxHeight={240} />
		</div>
	);
}
