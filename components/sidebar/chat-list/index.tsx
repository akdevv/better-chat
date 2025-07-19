"use client";

import { useSidebar } from "@/contexts/sidebar-context";
import { ChatItem } from "./chat-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/shared/spinner";
import { Button } from "@/components/ui/button";
import { FiSearch } from "react-icons/fi";
import Link from "next/link";

export function ChatList() {
	const { chats, isLoading, totalCount, ITEMS_PER_PAGE } = useSidebar();

	// Separate starred and regular chats
	const starredChats = chats.filter((chat) => chat.isStarred);
	const recentChats = chats.filter((chat) => !chat.isStarred);

	return (
		<>
			{isLoading ? (
				<div className="flex justify-center py-4">
					<Spinner />
				</div>
			) : (
				<ScrollArea className="h-full px-3">
					{/* Starred chats */}
					{starredChats.length > 0 && (
						<>
							<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider my-2">
								Starred
							</h3>
							<div className="space-y-0.5 mb-5">
								{starredChats.map((chat) => (
									<ChatItem key={chat.id} chat={chat} />
								))}
							</div>
						</>
					)}

					{/* Recent chats */}
					{recentChats.length > 0 && (
						<>
							<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider my-2">
								Recent
							</h3>
							<div className="space-y-0.5">
								{recentChats.map((chat) => (
									<ChatItem key={chat.id} chat={chat} />
								))}
							</div>
						</>
					)}

					{/* See all chats button */}
					{totalCount > ITEMS_PER_PAGE && (
						<div className="w-full my-2">
							<Link href="/recent">
								<Button className="flex w-full cursor-pointer justify-start gap-2 text-muted-foreground hover:text-foreground bg-secondary hover:bg-primary/50">
									<FiSearch className="h-4 w-4" />
									All chats
								</Button>
							</Link>
						</div>
					)}
				</ScrollArea>
			)}
		</>
	);
}
