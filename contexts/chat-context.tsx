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
	fetchMessages: () => void;
	handleCreateChat: (e: React.FormEvent) => void;
	handleSendMessage: (e: React.FormEvent) => void;

	
	onCancel: () => void;
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

	return (
		<ChatContext.Provider value={value}>{children}</ChatContext.Provider>
	);
}
