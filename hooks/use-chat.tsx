"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_MODEL } from "@/lib/ai/models";
import { ChatState, Message } from "@/lib/types/chat";
import { toast } from "sonner";

export function useChat() {
	const router = useRouter();
	const { chatId } = useParams();

	const [input, setInput] = useState("");
	const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
	const [isCreatingChat, setIsCreatingChat] = useState(false);
	const [chatState, setChatState] = useState<ChatState>({
		messages: [],
		isChatLoading: false,
		isStreamingResponse: false,
		error: null,
	});

	const abortControllerRef = useRef<AbortController | null>(null);
	const autoGenerateAIResponseRef = useRef(false);

	// Initial fetch messages
	const fetchMessages = useCallback(async () => {
		if (!chatId) return;

		setChatState((prev) => ({ ...prev, isChatLoading: true, error: null }));

		try {
			const res = await fetch(`/api/chats/${chatId}/messages`);
			if (!res.ok) {
				throw new Error("Failed to fetch messages");
			}

			const data = await res.json();
			setChatState((prev) => ({
				...prev,
				messages: data,
				isChatLoading: false,
			}));

			// Generate AI response only if one user message
			if (
				data.length === 1 &&
				data[0]?.role === "USER" &&
				!autoGenerateAIResponseRef.current
			) {
				autoGenerateAIResponseRef.current = true;
				generateAIResponse(
					chatId as string,
					data[0].content,
					selectedModel,
				);
			}
		} catch (error) {
			setChatState((prev) => ({
				...prev,
				isChatLoading: false,
				error: "Failed to fetch messages",
			}));
		}
	}, [chatId]);

	// create chat, save message, return chatId
	const handleCreateChat = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!input.trim() || isCreatingChat) return;
			setIsCreatingChat(true);

			try {
				const res = await fetch("/api/chats", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						initialMessage: input.trim(),
						model: selectedModel,
					}),
				});

				if (!res.ok) {
					throw new Error("Failed to create chat");
				}

				const data = await res.json();

				router.prefetch(`/chat/${data.chatId}`);
				router.push(`/chat/${data.chatId}`);
			} catch (error) {
				toast.error("Failed to create chat");
			} finally {
				setIsCreatingChat(false);
			}
		},
		[input, selectedModel, router],
	);

	// Send message
	const handleSendMessage = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();

			const trimmedInput = input.trim();
			if (
				!trimmedInput ||
				chatState.isChatLoading ||
				chatState.isStreamingResponse
			)
				return;

			if (trimmedInput.length > 4000) {
				toast.error("Please keep your message under 4000 characters.");
				return;
			}

			// Create user message
			const userMessage: Message = {
				id: `user-${Date.now()}`,
				chatId: chatId as string,
				role: "USER",
				content: trimmedInput,
				createdAt: new Date(),
				model: selectedModel,
			};
			setChatState((prev) => ({
				...prev,
				messages: [...prev.messages, userMessage],
			}));

			// Send message
			await generateAIResponse(
				chatId as string,
				trimmedInput,
				selectedModel,
			);
		},
		[
			chatId,
			input,
			selectedModel,
			chatState.isChatLoading,
			chatState.isStreamingResponse,
		],
	);

	const generateAIResponse = useCallback(
		async (chatId: string, message: string, model: string) => {
			if (!chatId) return;
			setChatState((prev) => ({ ...prev, isStreamingResponse: true }));

			// Create placeholder AI message
			const aiMessage: Message = {
				id: `ai-${Date.now()}`,
				chatId,
				role: "ASSISTANT",
				content: "",
				createdAt: new Date(),
				model,
			};
			setChatState((prev) => ({
				...prev,
				messages: [...prev.messages, aiMessage],
			}));

			try {
				setInput("");
				abortControllerRef.current = new AbortController();
				const res = await fetch(`/api/chats/${chatId}/messages`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ message, model }),
					signal: abortControllerRef.current?.signal,
				});

				if (!res.ok) {
					throw new Error("Failed to send message");
				}

				const reader = res.body!.getReader();
				const decoder = new TextDecoder();
				let accumulatedContent = "";

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value, { stream: true });
					accumulatedContent += chunk;

					// Update AI message content
					setChatState((prev) => ({
						...prev,
						messages: prev.messages.map((msg) =>
							msg.id === aiMessage.id
								? { ...msg, content: accumulatedContent }
								: msg,
						),
					}));
				}
			} catch (error) {
				console.error("Streaming error:", error);
				toast.error("Failed to get AI response. Please try again.");

				// Remove failed AI message
				setChatState((prev) => ({
					...prev,
					messages: prev.messages.filter(
						(msg) => msg.id !== aiMessage.id,
					),
				}));
			} finally {
				setChatState((prev) => ({
					...prev,
					isStreamingResponse: false,
				}));
				abortControllerRef.current = null;
			}
		},
		[chatId, selectedModel],
	);

	const onCancel = useCallback(() => {
		setInput("");
		setSelectedModel(DEFAULT_MODEL);
		autoGenerateAIResponseRef.current = false;
	}, []);

	useEffect(() => {
		if (chatId) {
			autoGenerateAIResponseRef.current = false;
			fetchMessages();
		}
	}, [chatId]);

	return {
		input,
		selectedModel,
		isCreatingChat,
		chatState,
		setInput,
		setSelectedModel,
		handleCreateChat,
		handleSendMessage,
		onCancel,
	};
}
