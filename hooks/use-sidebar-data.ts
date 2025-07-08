"use client";

import { SidebarChat } from "@/lib/types/sidebar";
import { endpoints } from "@/lib/api/endpoints";
import { useState, useCallback, useRef, useEffect, useOptimistic } from "react";

const ITEMS_PER_PAGE = 50;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

interface CacheEntry {
	data: SidebarChat[];
	timestamp: number;
	total: number;
}

export function useSidebarData() {
	const [chats, setChats] = useState<SidebarChat[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [page, setPage] = useState(0);

	const cache = useRef<CacheEntry | null>(null);

	const [optimisticChats, setOptimisticChats] = useOptimistic(
		chats,
		(state, update: { type: string; payload: any }) => {
			switch (update.type) {
				case "ADD":
					return [update.payload, ...state].sort(
						(a, b) =>
							new Date(b.updatedAt).getTime() -
							new Date(a.updatedAt).getTime()
					);
				case "UPDATE":
					return state
						.map((chat) =>
							chat.id === update.payload.id
								? update.payload
								: chat
						)
						.sort(
							(a, b) =>
								new Date(b.updatedAt).getTime() -
								new Date(a.updatedAt).getTime()
						);
				case "DELETE":
					return state.filter((chat) => chat.id !== update.payload);
				case "UPDATE_TITLE":
					return state.map((chat) =>
						chat.id === update.payload.id
							? { ...chat, title: update.payload.title }
							: chat
					);
				default:
					return state;
			}
		}
	);

	// cache validation
	const getCachedData = useCallback(() => {
		if (!cache.current) return null;
		const isExpired = Date.now() - cache.current.timestamp > CACHE_DURATION;
		return isExpired ? null : cache.current;
	}, []);

	// GET /chats => list of chats
	const fetchChats = useCallback(
		async (loadMore: boolean = false) => {
			// use cache for initial load
			if (!loadMore) {
				const cached = getCachedData();
				if (cached) {
					setChats(cached.data);
					setHasMore(cached.data.length < cached.total);
				}
			}

			const loading = loadMore ? setIsLoadingMore : setIsLoading;
			loading(true);

			try {
				const offset = loadMore ? page * ITEMS_PER_PAGE : 0;
				const res = await endpoints.chats.list({
					limit: ITEMS_PER_PAGE,
					offset,
				});

				const newChats = loadMore
					? [...chats, ...res.chats]
					: res.chats;
				newChats.sort(
					(a: SidebarChat, b: SidebarChat) =>
						new Date(b.updatedAt).getTime() -
						new Date(a.updatedAt).getTime()
				);

				setChats(newChats);
				setHasMore(res.chats.length === ITEMS_PER_PAGE);

				if (loadMore) {
					setPage((prev) => prev + 1);
				} else {
					setPage(1);
					// update cache
					cache.current = {
						data: newChats,
						timestamp: Date.now(),
						total: res.pagination.total,
					};
				}
			} catch (error) {
				console.error("Failed to fetch chats:", error);
				setHasMore(false);
			} finally {
				loading(false);
			}
		},
		[chats, page, getCachedData]
	);

	// DELETE /chats/:chatId => delete a chat
	const deleteChat = useCallback(
		async (chatId: string) => {
			setOptimisticChats({ type: "DELETE", payload: chatId });

			try {
				await endpoints.chats.delete(chatId);
				// update actual state
				setChats((prev) => prev.filter((chat) => chat.id !== chatId));
				cache.current = null;
			} catch (error) {
				console.error("Failed to delete chat:", error);
			}
		},
		[optimisticChats, setOptimisticChats]
	);

	// PATCH /chats/:chatId => (rename chat)
	const renameChat = useCallback(
		async (chatId: string, newTitle: string) => {
			const chat = optimisticChats.find((chat) => chat.id === chatId);
			if (!chat) return;

			const updatedChat: SidebarChat = {
				...chat,
				title: newTitle,
				updatedAt: new Date(),
			};

			setOptimisticChats({ type: "UPDATE", payload: updatedChat });

			try {
				const res = await endpoints.chats.rename(chatId, newTitle);

				// update actual state
				setChats((prev) => {
					const updated = prev.map((chat) =>
						chat.id === res.id ? res : chat
					);
					return updated.sort(
						(a, b) =>
							new Date(b.updatedAt).getTime() -
							new Date(a.updatedAt).getTime()
					);
				});
				cache.current = null;
			} catch (error) {
				console.error("Failed to rename chat:", error);
			}
		},
		[optimisticChats, setOptimisticChats]
	);

	// PATCH /chats/:chatId => (toggle star)
	const toggleStar = useCallback(
		async (chatId: string) => {
			const chat = optimisticChats.find((chat) => chat.id === chatId);
			if (!chat) return;

			const updatedChat: SidebarChat = {
				...chat,
				isStarred: !chat.isStarred,
				updatedAt: new Date(),
			};

			setOptimisticChats({ type: "UPDATE", payload: updatedChat });

			try {
				const res = await endpoints.chats.toggleStar(chatId);

				// update actual state
				setChats((prev) => {
					const updated = prev.map((chat) =>
						chat.id === res.id ? res : chat
					);
					return updated.sort(
						(a, b) =>
							new Date(b.updatedAt).getTime() -
							new Date(a.updatedAt).getTime()
					);
				});
				cache.current = null;
			} catch (error) {
				console.error("Failed to toggle star:", error);
			}
		},
		[optimisticChats, setOptimisticChats]
	);

	const addChat = useCallback(
		async (newChat: SidebarChat) => {
			setOptimisticChats({ type: "ADD", payload: newChat });

			// update actual state
			setChats((prev) =>
				[...prev, newChat].sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() -
						new Date(a.updatedAt).getTime()
				)
			);
		},
		[setOptimisticChats]
	);

	const generateTitle = useCallback(
		async (chatId: string, message: string) => {
			return "implement later";
		},
		[]
	);

	// inital load
	useEffect(() => {
		fetchChats();
	}, []);

	return {
		// Data
		chats: optimisticChats, // optimistic updates
		isLoading,
		isLoadingMore,
		hasMore,

		// Actions
		loadMore: () => !isLoadingMore && hasMore && fetchChats(true),
		refresh: () => {
			cache.current = null;
			setPage(0);
			fetchChats();
		},
		renameChat,
		toggleStar,
		deleteChat,
		addChat,
		generateTitle,
	};
}
