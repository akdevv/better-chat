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
				case "UPDATE_TIMESTAMP":
					return state
						.map((chat) =>
							chat.id === update.payload.id
								? {
										...chat,
										updatedAt: update.payload.updatedAt,
								  }
								: chat
						)
						.sort(
							(a, b) =>
								new Date(b.updatedAt).getTime() -
								new Date(a.updatedAt).getTime()
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

			// Update actual state immediately for instant feedback
			setChats((prev) => prev.filter((chat) => chat.id !== chatId));
			setTotalCount((prev) => Math.max(0, prev - 1));

			// Update cache immediately if it exists
			if (cache.current) {
				cache.current.data = cache.current.data.filter(
					(chat) => chat.id !== chatId
				);
				cache.current.total = Math.max(0, cache.current.total - 1);
			}

			// Optimistic update (wrapped in startTransition for React compliance)
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

			// Update actual state immediately for instant feedback
			setChats((prev) => {
				const updated = prev.map((chat) =>
					chat.id === chatId
						? { ...chat, title: newTitle, updatedAt: new Date() }
						: chat
				);
				return updated.sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() -
						new Date(a.updatedAt).getTime()
				);
			});

			// Update cache immediately if it exists
			if (cache.current) {
				cache.current.data = cache.current.data
					.map((chat) =>
						chat.id === chatId
							? {
									...chat,
									title: newTitle,
									updatedAt: new Date(),
							  }
							: chat
					)
					.sort(
						(a, b) =>
							new Date(b.updatedAt).getTime() -
							new Date(a.updatedAt).getTime()
					);
			}

			// Optimistic update (wrapped in startTransition for React compliance)
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

				// Update actual state with server response
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

			// Update actual state immediately for instant feedback
			setChats((prev) => {
				const updated = prev.map((chat) =>
					chat.id === chatId
						? {
								...chat,
								isStarred: !chat.isStarred,
								updatedAt: new Date(),
						  }
						: chat
				);
				return updated.sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() -
						new Date(a.updatedAt).getTime()
				);
			});

			// Update cache immediately if it exists
			if (cache.current) {
				cache.current.data = cache.current.data
					.map((chat) =>
						chat.id === chatId
							? {
									...chat,
									isStarred: !chat.isStarred,
									updatedAt: new Date(),
							  }
							: chat
					)
					.sort(
						(a, b) =>
							new Date(b.updatedAt).getTime() -
							new Date(a.updatedAt).getTime()
					);
			}

			// Optimistic update (wrapped in startTransition for React compliance)
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

				// Update actual state with server response
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

			// Update actual state immediately for instant feedback
			setChats((prev) =>
				[newChat, ...prev].sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() -
						new Date(a.updatedAt).getTime()
				)
			);
			setTotalCount((prev) => prev + 1);

			// Update cache immediately if it exists
			if (cache.current) {
				cache.current.data = [newChat, ...cache.current.data].sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() -
						new Date(a.updatedAt).getTime()
				);
				cache.current.total = cache.current.total + 1;
			}

			// Optimistic update (wrapped in startTransition for React compliance)
			startTransition(() => {
				setOptimisticChats({ type: "ADD", payload: newChat });
			});

			console.log("✅ Chat added to sidebar immediately");
		},
		[setOptimisticChats]
	);

	// Update chat title function (used by event listener)
	const updateChatTitle = useCallback(
		(chatId: string, newTitle: string) => {
			console.log(
				"🏷️ Updating chat title via event:",
				chatId,
				"to:",
				newTitle
			);

			// Update actual state immediately for instant feedback
			setChats((prev) =>
				prev.map((chat) =>
					chat.id === chatId ? { ...chat, title: newTitle } : chat
				)
			);

			// Update cache if it exists
			if (cache.current) {
				cache.current.data = cache.current.data.map((chat) =>
					chat.id === chatId ? { ...chat, title: newTitle } : chat
				);
			}

			// Optimistic update (wrapped in startTransition for React compliance)
			startTransition(() => {
				setOptimisticChats({
					type: "UPDATE_TITLE",
					payload: { id: chatId, title: newTitle },
				});
			});

			console.log("✅ Chat title updated in sidebar via event");
		},
		[setOptimisticChats]
	);

	// Update chat timestamp function (used by event listener for message activity)
	const updateChatTimestamp = useCallback(
		(chatId: string, updatedAt: Date) => {
			console.log(
				"⏰ Updating chat timestamp via event:",
				chatId,
				"to:",
				updatedAt
			);

			// Update actual state immediately for instant feedback
			setChats((prev) =>
				prev
					.map((chat) =>
						chat.id === chatId ? { ...chat, updatedAt } : chat
					)
					.sort(
						(a, b) =>
							new Date(b.updatedAt).getTime() -
							new Date(a.updatedAt).getTime()
					)
			);

			// Update cache if it exists
			if (cache.current) {
				cache.current.data = cache.current.data
					.map((chat) =>
						chat.id === chatId ? { ...chat, updatedAt } : chat
					)
					.sort(
						(a, b) =>
							new Date(b.updatedAt).getTime() -
							new Date(a.updatedAt).getTime()
					);
			}

			// Optimistic update (wrapped in startTransition for React compliance)
			startTransition(() => {
				setOptimisticChats({
					type: "UPDATE_TIMESTAMP",
					payload: { id: chatId, updatedAt },
				});
			});

			console.log("✅ Chat timestamp updated in sidebar via event");
		},
		[setOptimisticChats]
	);

	// Listen for chat creation events
	useEffect(() => {
		const handleChatCreated = (event: CustomEvent) => {
			const { chat } = event.detail;
			console.log("📡 Received chat created event:", chat);
			addChat(chat);
		};

		// Add event listener for chat creation
		window.addEventListener(
			"chatCreated",
			handleChatCreated as EventListener
		);
		console.log("👂 Listening for chatCreated events");

		// Cleanup on unmount
		return () => {
			window.removeEventListener(
				"chatCreated",
				handleChatCreated as EventListener
			);
			console.log("🧹 Removed chatCreated event listener");
		};
	}, [addChat]);

	// Listen for title update events
	useEffect(() => {
		const handleTitleUpdate = (event: CustomEvent) => {
			const { chatId, title } = event.detail;
			console.log("📡 Received title update event:", { chatId, title });
			updateChatTitle(chatId, title);
		};

		// Add event listener for title updates
		window.addEventListener(
			"chatTitleUpdated",
			handleTitleUpdate as EventListener
		);
		console.log("👂 Listening for chatTitleUpdated events");

		// Cleanup on unmount
		return () => {
			window.removeEventListener(
				"chatTitleUpdated",
				handleTitleUpdate as EventListener
			);
			console.log("🧹 Removed chatTitleUpdated event listener");
		};
	}, [updateChatTitle]);

	// Listen for chat update events (for message activity)
	useEffect(() => {
		const handleChatUpdated = (event: CustomEvent) => {
			const { chatId, updatedAt } = event.detail;
			console.log("📡 Received chat updated event:", {
				chatId,
				updatedAt,
			});
			updateChatTimestamp(chatId, new Date(updatedAt));
		};

		// Add event listener for chat updates
		window.addEventListener(
			"chatUpdated",
			handleChatUpdated as EventListener
		);
		console.log("👂 Listening for chatUpdated events");

		// Cleanup on unmount
		return () => {
			window.removeEventListener(
				"chatUpdated",
				handleChatUpdated as EventListener
			);
			console.log("🧹 Removed chatUpdated event listener");
		};
	}, [updateChatTimestamp]);

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
	};
}
