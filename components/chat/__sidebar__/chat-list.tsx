"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChatSidebarItem, ChatsResponse } from "@/lib/types/chat";

import ChatDropdownMenu from "./chat-dropdown-menu";
import { Spinner } from "@/components/shared/spinner";
import { Button } from "@/components/ui/button";

interface ChatItemProps {
	chat: ChatSidebarItem;
	handleChatUpdate: (chat: ChatSidebarItem) => void;
	handleChatDelete: (chatId: string) => void;
	handleChatRefresh: () => void;
}

interface ChatListProps {
	collapsed: boolean;
	isMobile: boolean;
}

const ChatItem = ({
	chat,
	handleChatUpdate,
	handleChatDelete,
	handleChatRefresh,
}: ChatItemProps) => {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<Link
			href={`/chat/${chat.id}`}
			className="group relative flex items-center gap-3 px-2 rounded-lg cursor-pointer transition-colors hover:bg-accent min-h-[40px]"
		>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium font-accent-foreground truncate">
					{chat.title}
				</p>
			</div>
			<ChatDropdownMenu
				chat={chat}
				onChatUpdate={handleChatUpdate}
				onChatDelete={handleChatDelete}
				onChatRefresh={handleChatRefresh}
				menuOpen={menuOpen}
				setMenuOpen={setMenuOpen}
			/>
		</Link>
	);
};

export default function ChatList({ collapsed, isMobile }: ChatListProps) {
	const LIMIT = 50;

	const [chats, setChats] = useState<ChatSidebarItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [offset, setOffset] = useState(0);

	const fetchChats = async (loadMore: boolean = false) => {
		const currentOffset = loadMore ? offset : 0;
		const loading = loadMore ? setIsLoadingMore : setIsLoading;

		loading(true);

		try {
			const res = await fetch(
				`/api/chats?limit=${LIMIT}&offset=${currentOffset}`
			);

			if (!res.ok) {
				throw new Error("Failed to fetch chats");
			}

			const data: ChatsResponse = await res.json();

			if (loadMore) {
				// append new chats to existing chats
				setChats((prevChats) => [...prevChats, ...data.chats]);
			} else {
				// set chats to new chats
				setChats(data.chats);
			}

			// update pagination
			setOffset(currentOffset + LIMIT);
			setHasMore(data.chats.length === LIMIT);
		} catch (error) {
			console.error("Error fetching chats: ", error);
			setHasMore(false);
		} finally {
			loading(false);
		}
	};

	const handleChatDelete = (chatId: string) => {
		setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
	};

	const handleChatUpdate = (updatedChat: ChatSidebarItem) => {
		setChats((prevChats) => {
			const updatedChats = prevChats.map((chat) =>
				chat.id === updatedChat.id ? updatedChat : chat
			);
			return updatedChats.sort((a, b) => {
				// starred chats first
				if (a.isStarred !== b.isStarred) {
					return a.isStarred ? -1 : 1;
				}
				// then sort by updatedAt (most recent first)
				return (
					new Date(b.updatedAt).getTime() -
					new Date(a.updatedAt).getTime()
				);
			});
		});
	};

	const handleChatRefresh = () => {
		setOffset(0);
		setHasMore(true);
		fetchChats(false);
	};

	const starredChats = chats.filter((chat) => chat.isStarred);
	const regularChats = chats.filter((chat) => !chat.isStarred);

	useEffect(() => {
		fetchChats();
	}, []);

	return (
		<div className="flex-1 px-3">
			{(!collapsed || isMobile) && (
				<div className="mt-2 space-y-0.5">
					{isLoading ? (
						<Spinner />
					) : (
						<>
							{starredChats.length > 0 && (
								<>
									<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider my-2">
										Starred Chats
									</h3>
									{starredChats.map((chat) => (
										<ChatItem
											key={chat.id}
											chat={chat}
											handleChatUpdate={handleChatUpdate}
											handleChatDelete={handleChatDelete}
											handleChatRefresh={
												handleChatRefresh
											}
										/>
									))}
								</>
							)}

							{regularChats.length > 0 && (
								<>
									<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider my-2">
										Recent Chats
									</h3>
									{regularChats.map((chat) => (
										<ChatItem
											key={chat.id}
											chat={chat}
											handleChatUpdate={handleChatUpdate}
											handleChatDelete={handleChatDelete}
											handleChatRefresh={
												handleChatRefresh
											}
										/>
									))}
								</>
							)}
						</>
					)}

					{/* load more button */}
					{!isLoading && !isLoadingMore && hasMore && (
						<div className="flex justify-center mt-3">
							<Button
								variant="outline"
								size="sm"
								className="cursor-pointer rounded-full text-muted-foreground border-muted-foreground/20 hover:bg-muted/50 px-4 py-1 h-7 text-xs"
								onClick={() => {
									fetchChats(true);
								}}
							>
								{isLoadingMore ? "Loading..." : "Load More"}
							</Button>
						</div>
					)}

					{/* loading more indicator */}
					{isLoadingMore && <Spinner />}
				</div>
			)}
		</div>
	);
}
