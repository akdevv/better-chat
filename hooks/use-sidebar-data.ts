"use client";

import { SidebarChat } from "@/lib/types/sidebar";
import {
	useState,
	useCallback,
	useRef,
	useEffect,
	useOptimistic,
	startTransition,
} from "react";

export const ITEMS_PER_PAGE = 30;

interface CacheEntry {
	data: SidebarChat[];
	timestamp: number;
	total: number;
}

export function useSidebarData() {
	const [chats, setChats] = useState<SidebarChat[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalCount, setTotalCount] = useState(0);

	const cache = useRef<CacheEntry | null>(null);

	const [optimisticChats, setOptimisticChats] = useOptimistic(
		chats,
		(state, update: { type: string; payload: any }) => {
			console.log("🔄 Optimistic update:", update.type, update.payload);
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

	// Get cached data (no expiration)
	const getCachedData = useCallback(() => {
		console.log(
			"📦 Getting cached data:",
			cache.current ? "Found" : "Not found"
		);
		return cache.current;
	}, []);

	// Get current chat by ID
	const getCurrentChat = useCallback(
		(chatId: string): SidebarChat | undefined => {
			const chat = optimisticChats.find((chat) => chat.id === chatId);
			console.log(
				"🔍 Getting current chat:",
				chatId,
				chat ? "Found" : "Not found"
			);
			return chat;
		},
		[optimisticChats]
	);

	// Invalidate cache and fetch in background
	const invalidateCacheAndRefetch = useCallback(async () => {
		console.log("🗑️ Invalidating cache and fetching in background");
		cache.current = null;

		// Fetch in background without loading states
		try {
			const res = await fetch(`/api/chats?limit=${ITEMS_PER_PAGE}`);
			if (!res.ok) {
				throw new Error("Failed to fetch chats in background");
			}

			const data = await res.json();
			const newChats = data.chats;
			newChats.sort(
				(a: SidebarChat, b: SidebarChat) =>
					new Date(b.updatedAt).getTime() -
					new Date(a.updatedAt).getTime()
			);

			console.log(
				"🔄 Background fetch completed, updating cache and state"
			);

			// Update cache
			cache.current = {
				data: newChats,
				timestamp: Date.now(),
				total: data.pagination.total,
			};

			// Update state
			setChats(newChats);
			setTotalCount(data.pagination.total);
		} catch (error) {
			console.error("❌ Background fetch failed:", error);
		}
	}, []);

	// GET /chats => list of chats (first 30 only)
	const fetchChats = useCallback(async () => {
		console.log("📡 Fetching chats: Initial load");

		// Use cache for initial load
		const cached = getCachedData();
		if (cached) {
			console.log("✅ Using cached data, skipping API call");
			setChats(cached.data);
			setTotalCount(cached.total);
			return;
		}

		setIsLoading(true);

		try {
			console.log("📡 Making API call for first 30 chats");

			const res = await fetch(`/api/chats?limit=${ITEMS_PER_PAGE}`);

			if (!res.ok) {
				throw new Error("Failed to fetch chats");
			}

			const data = await res.json();
			console.log(
				"📡 API response received:",
				data.chats.length,
				"chats, total:",
				data.pagination.total
			);

			const newChats = data.chats;
			newChats.sort(
				(a: SidebarChat, b: SidebarChat) =>
					new Date(b.updatedAt).getTime() -
					new Date(a.updatedAt).getTime()
			);

			setChats(newChats);
			setTotalCount(data.pagination.total);

			// Update cache
			console.log("💾 Updating cache with new data");
			cache.current = {
				data: newChats,
				timestamp: Date.now(),
				total: data.pagination.total,
			};
		} catch (error) {
			console.error("❌ Failed to fetch chats:", error);
		} finally {
			setIsLoading(false);
		}
	}, [getCachedData]);

	// DELETE /chats/:chatId => delete a chat
	const deleteChat = useCallback(
		async (chatId: string) => {
			console.log("🗑️ Deleting chat:", chatId);

			startTransition(() => {
				setOptimisticChats({ type: "DELETE", payload: chatId });
			});

			try {
				const res = await fetch(`/api/chats/${chatId}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!res.ok) {
					throw new Error("Failed to delete chat");
				}

				console.log("✅ Chat deleted successfully");

				// Update actual state
				setChats((prev) => prev.filter((chat) => chat.id !== chatId));
				setTotalCount((prev) => Math.max(0, prev - 1));

				// Invalidate cache and fetch in background
				await invalidateCacheAndRefetch();
			} catch (error) {
				console.error("❌ Failed to delete chat:", error);
				// Revert optimistic update by refetching
				fetchChats();
			}
		},
		[setOptimisticChats, invalidateCacheAndRefetch, fetchChats]
	);

	// PATCH /chats/:chatId => (rename chat)
	const renameChat = useCallback(
		async (chatId: string, newTitle: string) => {
			console.log("✏️ Renaming chat:", chatId, "to:", newTitle);

			const chat = optimisticChats.find((chat) => chat.id === chatId);
			if (!chat) {
				console.error("❌ Chat not found for renaming:", chatId);
				return;
			}

			const updatedChat: SidebarChat = {
				...chat,
				title: newTitle,
				updatedAt: new Date(),
			};

			startTransition(() => {
				setOptimisticChats({ type: "UPDATE", payload: updatedChat });
			});

			try {
				const res = await fetch(`/api/chats/${chatId}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ title: newTitle, action: "rename" }),
				});

				if (!res.ok) {
					throw new Error("Failed to rename chat");
				}

				const serverUpdatedChat = await res.json();
				console.log("✅ Chat renamed successfully");

				// Update actual state
				setChats((prev) => {
					const updated = prev.map((chat) =>
						chat.id === serverUpdatedChat.id
							? serverUpdatedChat
							: chat
					);
					return updated.sort(
						(a, b) =>
							new Date(b.updatedAt).getTime() -
							new Date(a.updatedAt).getTime()
					);
				});

				// Invalidate cache and fetch in background
				await invalidateCacheAndRefetch();
			} catch (error) {
				console.error("❌ Failed to rename chat:", error);
				// Revert optimistic update by refetching
				fetchChats();
			}
		},
		[
			optimisticChats,
			setOptimisticChats,
			invalidateCacheAndRefetch,
			fetchChats,
		]
	);

	// PATCH /chats/:chatId => (toggle star)
	const toggleStar = useCallback(
		async (chatId: string) => {
			console.log("⭐ Toggling star for chat:", chatId);

			const chat = optimisticChats.find((chat) => chat.id === chatId);
			if (!chat) {
				console.error("❌ Chat not found for starring:", chatId);
				return;
			}

			const updatedChat: SidebarChat = {
				...chat,
				isStarred: !chat.isStarred,
				updatedAt: new Date(),
			};

			startTransition(() => {
				setOptimisticChats({ type: "UPDATE", payload: updatedChat });
			});

			try {
				const res = await fetch(`/api/chats/${chatId}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ action: "toggle_star" }),
				});

				if (!res.ok) {
					throw new Error("Failed to toggle star");
				}

				const serverUpdatedChat = await res.json();
				console.log("✅ Chat star toggled successfully");

				// Update actual state
				setChats((prev) => {
					const updated = prev.map((chat) =>
						chat.id === serverUpdatedChat.id
							? serverUpdatedChat
							: chat
					);
					return updated.sort(
						(a, b) =>
							new Date(b.updatedAt).getTime() -
							new Date(a.updatedAt).getTime()
					);
				});

				// Invalidate cache and fetch in background
				await invalidateCacheAndRefetch();
			} catch (error) {
				console.error("❌ Failed to toggle star:", error);
				// Revert optimistic update by refetching
				fetchChats();
			}
		},
		[
			optimisticChats,
			setOptimisticChats,
			invalidateCacheAndRefetch,
			fetchChats,
		]
	);

	const addChat = useCallback(
		async (newChat: SidebarChat) => {
			console.log("➕ Adding new chat:", newChat.id);

			startTransition(() => {
				setOptimisticChats({ type: "ADD", payload: newChat });
			});

			// Update actual state
			setChats((prev) =>
				[...prev, newChat].sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() -
						new Date(a.updatedAt).getTime()
				)
			);
			setTotalCount((prev) => prev + 1);

			// Invalidate cache and fetch in background
			await invalidateCacheAndRefetch();
		},
		[setOptimisticChats, invalidateCacheAndRefetch]
	);

	const generateTitle = useCallback(
		async (chatId: string, message: string) => {
			console.log("🏷️ Generating title for chat:", chatId);
			return "implement later";
		},
		[]
	);

	// Initial load
	useEffect(() => {
		console.log("🚀 Initial load effect triggered");
		fetchChats();
	}, []);

	return {
		// Data
		chats: optimisticChats,
		isLoading,
		totalCount,
		ITEMS_PER_PAGE,

		// Actions
		refresh: () => {
			console.log("🔄 Manual refresh requested");
			cache.current = null;
			fetchChats();
		},
		getCurrentChat,
		renameChat,
		toggleStar,
		deleteChat,
		addChat,
		generateTitle,
	};
}
