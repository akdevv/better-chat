"use client";

import { ChatSidebarItem, ChatsResponse } from "@/lib/types/chat";
import { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
	// data
	chats: ChatSidebarItem[];
	isLoading: boolean;
	isLoadingMore: boolean;
	hasMore: boolean;

	// functions
	handleChatDelete: (chatId: string) => void;
	handleChatUpdate: (updatedChat: ChatSidebarItem) => void;
	handleChatRefresh: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within SidebarProvider");
	}
	return context;
};

export const SidebarProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
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

	useEffect(() => {
		fetchChats();
	}, []);

	const value: SidebarContextType = {
		chats,
		isLoading,
		isLoadingMore,
		hasMore,
		handleChatDelete,
		handleChatUpdate,
		handleChatRefresh,
	};

	return (
		<SidebarContext.Provider value={value}>
			{children}
		</SidebarContext.Provider>
	);
};
