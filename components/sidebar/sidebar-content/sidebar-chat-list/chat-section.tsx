import { ChatItem } from "./chat-item";
import { SidebarChat } from "@/lib/types/sidebar";

interface ChatSectionProps {
	title: string;
	chats: SidebarChat[];
	isLoading?: boolean;
}

export function ChatSection({
	title,
	chats,
	isLoading = false,
}: ChatSectionProps) {
	if (chats.length === 0 && !isLoading) {
		return null;
	}

	return (
		<div className="mb-4">
			<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider my-2">
				{title}
			</h3>

			{/* Chat items */}
			<div className="space-y-0.5">
				{chats.map((chat) => (
					<ChatItem key={chat.id} chat={chat} />
				))}
			</div>
		</div>
	);
}
