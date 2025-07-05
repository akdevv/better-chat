"use client";

import {
	SidebarChat,
	SidebarChatResponse,
	SidebarContextType,
} from "@/lib/types/sidebar";
import {
	createContext,
	useContext,
	useCallback,
	useState,
	useMemo,
	useEffect,
} from "react";

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

	const [chats, setChats] = useState<SidebarChat[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [offset, setOffset] = useState(0);

	const fetchChats = useCallback(
		async (loadMore: boolean = false) => {
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

				const data: SidebarChatResponse = await res.json();

				if (loadMore) {
					setChats((prevChats) => [...prevChats, ...data.chats]);
				} else {
					setChats(data.chats);
				}

				const newOffset = currentOffset + LIMIT;
				setOffset(newOffset);
				setHasMore(data.chats.length === LIMIT);
			} catch (error) {
				console.error("Error fetching chats: ", error);
				setHasMore(false);
			} finally {
				loading(false);
			}
		},
		[LIMIT]
	);

	const handleChatDelete = useCallback((chatId: string) => {
		setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
	}, []);

	const handleChatUpdate = useCallback((updatedChat: SidebarChat) => {
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
	}, []);

	const handleChatRefresh = useCallback(() => {
		setOffset(0);
		setHasMore(true);
		fetchChats(false);
	}, []);

	const loadMoreChats = useCallback(() => {
		if (!isLoadingMore && hasMore) {
			fetchChats(true);
		}
	}, []);

	useEffect(() => {
		fetchChats(false);
	}, []);

	const value: SidebarContextType = useMemo(
		() => ({
			chats,
			isLoading,
			isLoadingMore,
			hasMore,
			fetchChats,
			handleChatDelete,
			handleChatUpdate,
			handleChatRefresh,
			loadMoreChats,
		}),
		[
			chats,
			isLoading,
			isLoadingMore,
			hasMore,
			fetchChats,
			handleChatDelete,
			handleChatUpdate,
			handleChatRefresh,
			loadMoreChats,
		]
	);

	return (
		<SidebarContext.Provider value={value}>
			{children}
		</SidebarContext.Provider>
	);
};
