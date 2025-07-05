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
	useRef,
} from "react";

interface CacheEntry {
	data: SidebarChat[];
	timestamp: number;
	total: number;
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
	const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
	const cache = useRef<CacheEntry | null>(null);

	const [chats, setChats] = useState<SidebarChat[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [offset, setOffset] = useState(0);
	const [total, setTotal] = useState(0);

	// check if cache is valid
	const isCacheValid = useCallback(() => {
		if (!cache.current) return false;
		return Date.now() - cache.current.timestamp < CACHE_DURATION; // Fixed: was > should be <
	}, []);

	// invalidate cache
	const invalidateCache = useCallback(() => {
		cache.current = null;
	}, []);

	// update cache
	const updateCache = useCallback((chats: SidebarChat[], total: number) => {
		cache.current = {
			data: chats,
			timestamp: Date.now(),
			total,
		};
	}, []);

	const fetchChats = useCallback(
		async (loadMore: boolean = false, useCache: boolean = true) => {
			const currentOffset = loadMore ? offset : 0;
			const loading = loadMore ? setIsLoadingMore : setIsLoading;

			// use cache if available and valid (only for initial load)
			if (useCache && !loadMore && isCacheValid()) {
				const cachedData = cache.current!;
				// Sort cached data by updatedAt (most recent first)
				const sortedCachedData = [...cachedData.data].sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() -
						new Date(a.updatedAt).getTime()
				);
				setChats(sortedCachedData);
				setTotal(cachedData.total);
				setOffset(Math.min(cachedData.data.length, LIMIT));
				setHasMore(cachedData.data.length < cachedData.total);
				return;
			}

			loading(true);

			try {
				const res = await fetch(
					`/api/chats?limit=${LIMIT}&offset=${currentOffset}`
				);

				if (!res.ok) {
					throw new Error("Failed to fetch chats");
				}

				const data: SidebarChatResponse = await res.json();

				let newChats: SidebarChat[];
				if (loadMore) {
					newChats = [...chats, ...data.chats];
				} else {
					newChats = data.chats;
				}

				// sort by updatedAt (most recent first)
				newChats = newChats.sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() -
						new Date(a.updatedAt).getTime()
				);

				setChats(newChats);

				const newOffset = currentOffset + LIMIT;
				setOffset(newOffset);
				setHasMore(data.chats.length === LIMIT);
				setTotal(data.pagination.total);

				// update cache
				if (!loadMore) {
					updateCache(newChats, data.pagination.total);
				}
			} catch (error) {
				console.error("Error fetching chats: ", error);
				setHasMore(false);
			} finally {
				loading(false);
			}
		},
		[LIMIT, offset, chats, isCacheValid, updateCache]
	);

	const handleChatDelete = useCallback(
		(chatId: string) => {
			setChats((prevChats) =>
				prevChats.filter((chat) => chat.id !== chatId)
			);

			// invalidate cache & bg refresh
			invalidateCache();
			setTimeout(() => {
				fetchChats(false, false);
			}, 100);
		},
		[fetchChats, invalidateCache]
	);

	const handleChatUpdate = useCallback(
		(updatedChat: SidebarChat) => {
			// Optimistic update
			setChats((prevChats) => {
				const updatedChats = prevChats.map((chat) =>
					chat.id === updatedChat.id ? updatedChat : chat
				);
				return updatedChats.sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() -
						new Date(a.updatedAt).getTime()
				);
			});

			// invalidate cache & bg refresh
			invalidateCache();
			setTimeout(() => {
				fetchChats(false, false);
			}, 100);
		},
		[fetchChats, invalidateCache]
	);

	const handleChatRefresh = useCallback(() => {
		invalidateCache();
		setOffset(0);
		setHasMore(true);
		fetchChats(false, false);
	}, [fetchChats, invalidateCache]);

	const loadMoreChats = useCallback(() => {
		if (!isLoadingMore && hasMore) {
			fetchChats(true, false);
		}
	}, [fetchChats, hasMore, isLoadingMore]);

	// auto-gen ai title for new chats - CLEANER VERSION
	const generateAiTitle = useCallback(
		async (chatId: string, userMessage: string) => {
			try {
				console.log("chatId of generateAiTitle", chatId);
				console.log("userMessage of generateAiTitle", userMessage);

				// Access current chats directly from state
				setChats((currentChats) => {
					console.log(
						"currentChats in generateAiTitle",
						currentChats
					);

					const chatToUpdate = currentChats.find(
						(chat) => chat.id === chatId
					);
					console.log("chatToUpdate", chatToUpdate);

					if (!chatToUpdate) {
						console.log(
							"Chat not found, skipping title generation"
						);
						return currentChats;
					}

					if (chatToUpdate.title !== "Untitled Chat") {
						console.log(
							"Chat already has a title, skipping generation"
						);
						return currentChats;
					}

					// If we get here, we can proceed with title generation
					// First show loading state
					const loadingChat: SidebarChat = {
						...chatToUpdate,
						title: "Generating title...",
						updatedAt: new Date(),
					};

					// Start the async title generation (don't await here)
					generateTitleAsync(chatId, userMessage, chatToUpdate);

					// Return updated chats with loading state
					return currentChats.map((chat) =>
						chat.id === chatId ? loadingChat : chat
					);
				});
			} catch (error) {
				console.error("Error in generateAiTitle: ", error);
			}
		},
		[]
	);

	// Separate async function for the actual API call
	const generateTitleAsync = useCallback(
		async (
			chatId: string,
			userMessage: string,
			originalChat: SidebarChat
		) => {
			try {
				const res = await fetch(`/api/chats/${chatId}/generate-title`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ userMessage }),
				});

				console.log("res of generateAiTitle", res);

				if (!res.ok) {
					throw new Error("Failed to generate chat title");
				}

				const { title } = await res.json();
				console.log("title of generateAiTitle", title);

				const updatedChat: SidebarChat = {
					...originalChat,
					title,
					updatedAt: new Date(),
				};

				console.log("updatedChat of generateAiTitle", updatedChat);

				// Update with the actual title
				setChats((currentChats) =>
					currentChats.map((chat) =>
						chat.id === chatId ? updatedChat : chat
					)
				);

				// Invalidate cache & refresh in background
				invalidateCache();
				setTimeout(() => {
					fetchChats(false, false);
				}, 100);
			} catch (error) {
				console.error("Error generating chat title: ", error);

				// Revert to original title on error
				setChats((currentChats) =>
					currentChats.map((chat) =>
						chat.id === chatId
							? { ...originalChat, title: "Untitled Chat" }
							: chat
					)
				);
			}
		},
		[invalidateCache, fetchChats]
	);

	// add new chat - optimistic update
	const addNewChat = useCallback(
		(newChat: SidebarChat) => {
			console.log("Adding new chat to sidebar:", newChat);
			setChats((prevChats) => {
				const updatedChats = [newChat, ...prevChats];
				// Sort by updatedAt (most recent first)
				return updatedChats.sort(
					(a, b) =>
						new Date(b.updatedAt).getTime() -
						new Date(a.updatedAt).getTime()
				);
			});
			invalidateCache();
		},
		[invalidateCache]
	);

	useEffect(() => {
		fetchChats(false, true);
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
			generateAiTitle,
			addNewChat,
			invalidateCache,
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
			generateAiTitle,
			addNewChat,
			invalidateCache,
		]
	);

	return (
		<SidebarContext.Provider value={value}>
			{children}
		</SidebarContext.Provider>
	);
};
