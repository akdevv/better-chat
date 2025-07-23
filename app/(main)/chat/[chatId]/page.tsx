import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { Header } from "@/components/chat/header";

interface ChatPageProps {
	params: Promise<{ chatId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
	const { chatId } = await params;
	const session = await auth();

	if (!session?.user?.id) {
		notFound();
	}

	// Check if chat exists and belongs to user
	const chat = await db.chat.findUnique({
		where: {
			id: chatId,
			userId: session.user.id,
		},
	});

	if (!chat) {
		notFound();
	}

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
