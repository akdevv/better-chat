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
				const fileIds =
					data[0].files?.map((file: any) => file.id) || [];
				generateAIResponse(
					chatId as string,
					data[0].content,
					selectedModel,
					fileIds
				);
			}
		} catch (error) {
			setChatState((prev) => ({
				...prev,
				isChatLoading: false,
				error: "Failed to fetch messages",
			}));
		}
	}, [chatId, selectedModel]);

	// create chat, save message, return chatId
	const handleCreateChat = useCallback(
		async (
			e: React.FormEvent,
			uploadedFileIds?: string[],
			onFilesLinked?: (chatId: string, messageId: string) => Promise<void>
		) => {
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

				// If there are uploaded files, link them to the message
				if (
					uploadedFileIds &&
					uploadedFileIds.length > 0 &&
					onFilesLinked
				) {
					console.log("→ Linking files to new chat message...");
					try {
						console.log("useChat handleCreateChat onFilesLinked");
						console.log("data", data);
						await onFilesLinked(data.chatId, data.messageId);
					} catch (error) {
						console.error("Failed to link files:", error);
						// Don't block chat creation for file linking failure
						toast.warning(
							"Chat created but files couldn't be attached"
						);
					}
				}

				router.prefetch(`/chat/${data.chatId}`);
				router.push(`/chat/${data.chatId}`);
			} catch (error) {
				toast.error("Failed to create chat");
			} finally {
				setIsCreatingChat(false);
			}
		},
		[input, selectedModel, router]
	);

	// Send message with optional file upload callback
	const handleSendMessage = useCallback(
		async (
			e: React.FormEvent,
			uploadedFileIds?: string[],
			onFilesLinked?: (chatId: string, messageId: string) => Promise<void>
		) => {
			e.preventDefault();

			const trimmedInput = input.trim();
			const hasFiles = uploadedFileIds && uploadedFileIds.length > 0;

			if (
				(!trimmedInput && !hasFiles) ||
				chatState.isChatLoading ||
				chatState.isStreamingResponse
			)
				return;

			if (trimmedInput.length > 4000) {
				toast.error("Please keep your message under 4000 characters.");
				return;
			}

			try {
				// Step 1: Create the user message first
				console.log("=== Creating user message ===");

				const userMessageResponse = await fetch(
					`/api/chats/${chatId}/messages`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							message: trimmedInput || "📎 Files attached",
							model: selectedModel,
							generateAIResponse: false, // Only create user message
							fileIds: uploadedFileIds || [],
						}),
					}
				);

				if (!userMessageResponse.ok) {
					throw new Error("Failed to create message");
				}

				const createdMessage = await userMessageResponse.json();
				console.log("User message created:", createdMessage);

				// Step 2: Add the message to UI immediately
				const userMessage: Message = {
					id: createdMessage.id,
					chatId: chatId as string,
					role: "USER",
					content: trimmedInput || "📎 Files attached",
					createdAt: new Date(createdMessage.createdAt),
					model: selectedModel,
					files: [], // Will be updated after upload
				};

				setChatState((prev) => ({
					...prev,
					messages: [...prev.messages, userMessage],
				}));

				// Step 3: Upload files if any (this happens in the background)
				if (hasFiles && onFilesLinked) {
					console.log("→ Starting file upload...");
					try {
						console.log("useChat handleSendMessage onFilesLinked");
						console.log("chatId", chatId);
						console.log("createdMessage.id", createdMessage.id);
						await onFilesLinked(
							chatId as string,
							createdMessage.id
						);
						console.log("→ Files uploaded successfully");

						// Refresh messages to get updated file info
						await fetchMessages();
					} catch (error) {
						console.error("→ File upload failed:", error);
						// Message is created but files failed - not critical
						toast.error(
							"Message sent but some files failed to upload"
						);
					}
				}

				// Step 4: Clear input and start AI response
				setInput("");

				// Step 5: Generate AI response
				await generateAIResponse(
					chatId as string,
					trimmedInput || "Files attached",
					selectedModel,
					uploadedFileIds
				);
			} catch (error) {
				console.error("Error sending message:", error);
				toast.error("Failed to send message");
			}
		},
		[
			chatId,
			input,
			selectedModel,
			chatState.isChatLoading,
			chatState.isStreamingResponse,
			fetchMessages,
		]
	);

	const generateAIResponse = useCallback(
		async (
			chatId: string,
			message: string,
			model: string,
			uploadedFileIds?: string[]
		) => {
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
				abortControllerRef.current = new AbortController();
				const res = await fetch(`/api/chats/${chatId}/messages`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						message,
						model,
						generateAIResponse: true, // Generate AI response
						fileIds: uploadedFileIds || [],
					}),
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
								: msg
						),
					}));
				}
			} catch (error) {
				console.error("Streaming error:", error);

				// Check if it was aborted (user stopped the response)
				if (error instanceof Error && error.name === "AbortError") {
					// Keep the partial response and save it to database
					setChatState((prev) => {
						const currentMessage = prev.messages.find(
							(msg) => msg.id === aiMessage.id
						);
						if (currentMessage && currentMessage.content.trim()) {
							// Save partial response to database
							fetch(`/api/chats/${chatId}/messages`, {
								method: "PATCH",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									content: currentMessage.content,
									model: selectedModel,
								}),
							}).catch(console.error);
						}
						return prev;
					});
				} else {
					toast.error("Failed to get AI response. Please try again.");
					// Remove failed AI message only if it's not an abort
					setChatState((prev) => ({
						...prev,
						messages: prev.messages.filter(
							(msg) => msg.id !== aiMessage.id
						),
					}));
				}
			} finally {
				setChatState((prev) => ({
					...prev,
					isStreamingResponse: false,
				}));
				abortControllerRef.current = null;
			}
		},
		[selectedModel]
	);

	const onCancel = useCallback(() => {
		setInput("");
		autoGenerateAIResponseRef.current = false;
	}, []);

	const onStop = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;

			// Process the current accumulated content for thinking responses
			setChatState((prev) => {
				const updatedMessages = prev.messages.map((msg) => {
					// Find the AI message that's currently being streamed
					if (msg.role === "ASSISTANT" && msg.content) {
						let finalContent = msg.content;

						if (
							finalContent.includes("<think>") &&
							!finalContent.includes("</think>")
						) {
							finalContent += "</think>";
						}

						return { ...msg, content: finalContent };
					}
					return msg;
				});

				return {
					...prev,
					messages: updatedMessages,
					isStreamingResponse: false,
				};
			});

			toast.info("Response stopped");
		}
	}, []);

	useEffect(() => {
		if (chatId) {
			autoGenerateAIResponseRef.current = false;
			fetchMessages();
		}
	}, [chatId, fetchMessages]);

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
		onStop,
	};
}
