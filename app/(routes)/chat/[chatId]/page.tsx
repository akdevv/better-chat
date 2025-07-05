"use client";

import { useParams } from "next/navigation";
import { Message } from "@/lib/types/chat";
import { useState, useRef, useEffect } from "react";
import { AI_MODELS } from "@/lib/ai/models";
import { useModelCache } from "@/hooks/use-model-cache";

import { ChatBubble } from "@/components/chat/chat-bubble";
import { ChatInput } from "@/components/chat/chat-input";

export default function ChatPage() {
	const { chatId } = useParams();

	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
	const [messages, setMessages] = useState<Message[]>([]);
	const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const fetchMessages = async () => {
		const res = await fetch(`/api/chats/${chatId}/messages`);
		if (!res.ok) {
			throw new Error("Failed to fetch messages");
		}
		const data = await res.json();
		setMessages(data.messages);

		// Check if we need to get AI response for the first user message
		if (data.messages.length === 1 && data.messages[0].role === "USER") {
			await getAIResponse(
				data.messages[0].content,
				data.messages[0].model
			);
		}
	};

	const getAIResponse = async (message: string, model: string) => {
		setIsLoading(true);
		setIsWaitingForResponse(true);

		// create placeholder ai message
		const aiMessageId = `ai-${Date.now()}-${Math.random()
			.toString(36)
			.substr(2, 9)}`;
		const placeholderMessage: Message = {
			id: aiMessageId,
			chatId: chatId as string,
			role: "ASSISTANT",
			content: "",
			createdAt: new Date(),
			model: model,
		};

		setMessages((prevMessages) => [...prevMessages, placeholderMessage]);

		try {
			const res = await fetch(`/api/chats/${chatId}/messages`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message, model }),
			});
			if (!res.ok) {
				throw new Error("Failed to send message");
			}

			// streaming response
			const reader = res.body?.getReader();
			if (!reader) {
				throw new Error("Failed to get reader");
			}

			let accumulatedResponse = "";
			let isFirstChunk = true;
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				// stop showing waiting indicators
				if (isFirstChunk) {
					setIsWaitingForResponse(false);
					isFirstChunk = false;
				}

				const chunk = new TextDecoder().decode(value);
				accumulatedResponse += chunk;

				// Update the AI message in real-time during streaming
				setMessages((prevMessages) => {
					const updatedMessages = prevMessages.map((msg) => {
						if (msg.id === aiMessageId) {
							return { ...msg, content: accumulatedResponse };
						}
						return msg;
					});
					return updatedMessages;
				});

				// auto-scroll
				setTimeout(() => {
					scrollAreaRef.current?.scrollIntoView({
						behavior: "smooth",
						block: "end",
					});
				}, 0);
				await new Promise((resolve) => setTimeout(resolve, 10));
			}
		} catch (error) {
			console.error("Error sending message: ", error);
			// Remove the placeholder message if there's an error
			setMessages((prevMessages) =>
				prevMessages.filter((msg) => msg.id !== aiMessageId)
			);
		} finally {
			setIsLoading(false);
			setIsWaitingForResponse(false);
		}
	};

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;
		setIsLoading(true);

		const messageToSend = input.trim();
		setInput("");

		// optimistically set user message
		const userMessageId = `user-${Date.now()}-${Math.random()
			.toString(36)
			.substr(2, 9)}`;
		const userMessage: Message = {
			id: userMessageId,
			chatId: chatId as string,
			role: "USER" as const,
			content: messageToSend,
			createdAt: new Date(),
			model: selectedModel,
		};
		setMessages((prevMessages) => [...prevMessages, userMessage]);

		try {
			await getAIResponse(messageToSend, selectedModel);
		} catch (error) {
			console.error("Error sending message: ", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (chatId) {
			fetchMessages();
		}
	}, [chatId]);

	// Auto-scroll when messages change
	useEffect(() => {
		setTimeout(() => {
			scrollAreaRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "end",
			});
		}, 100);
	}, [messages]);

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-y-auto">
				<ChatBubble
					messages={messages}
					scrollAreaRef={scrollAreaRef}
					messagesEndRef={messagesEndRef}
					isWaitingForResponse={isWaitingForResponse}
				/>
			</div>

			<div className="sticky bottom-0 p-2 sm:p-3 bg-background">
					<ChatInput
						input={input}
						setInput={setInput}
						isLoading={isLoading}
						selectedModel={selectedModel}
						setSelectedModel={setSelectedModel}
						onSendMessage={handleSendMessage}
					/>
			</div>
		</div>
	);
}
