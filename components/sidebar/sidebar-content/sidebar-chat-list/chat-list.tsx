"use client";

import { ChatSection } from "./chat-section";
import { Spinner } from "@/components/shared/spinner";
import { useSidebar, useSidebarUI } from "@/components/sidebar";

export function ChatList() {
	const { chats, isLoading, isLoadingMore, hasMore, loadMoreChats } =
		useSidebar();

	// Separate starred and regular chats
	const starredChats = chats.filter((chat) => chat.isStarred);
	const recentChats = chats.filter((chat) => !chat.isStarred);

	return (
			<div className="mt-2 space-y-0.5">
				{isLoading ? (
					<div className="flex justify-center py-8">
						<Spinner />
					</div>
				) : (
					<>
						{/* Starred chats */}
						{starredChats.length > 0 && (
							<ChatSection
								title="Starred Chats"
								chats={starredChats}
							/>
						)}

						{/* Recent chats */}
						{recentChats.length > 0 && (
							<ChatSection
								title="Recent Chats"
								chats={recentChats}
							/>
						)}
					</>
			)}
		</div>
	);
}
