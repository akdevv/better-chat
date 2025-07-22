"use client";

import { useChat } from "@/hooks/use-chat";
import { ChatState } from "@/lib/types/chat";
import { createContext, useContext } from "react";

interface ChatContextValue {
	// States
	input: string;
	selectedModel: string;
	isCreatingChat: boolean;
	chatState: ChatState;

	// Actions
	setInput: (input: string) => void;
	setSelectedModel: (model: string) => void;
	handleCreateChat: (
		e: React.FormEvent,
		uploadedFileIds?: string[],
		onFilesLinked?: (chatId: string, messageId: string) => Promise<void>,
	) => void;
	handleSendMessage: (
		e: React.FormEvent,
		uploadedFileIds?: string[],
		onFilesLinked?: (chatId: string, messageId: string) => Promise<void>,
	) => void;
	onCancel: () => void;
	onStop: () => void;
	generateTitle: (chatId: string, userMessage: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function useChatContext() {
	const context = useContext(ChatContext);
	if (!context) {
		throw new Error("useChat must be used within ChatProvider");
	}
	return context;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const chat = useChat();
	const value: ChatContextValue = { ...chat };

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
