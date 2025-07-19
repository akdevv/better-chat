export type Chat = {
	id: string;
	userId: string;
	title: string;
	isStarred: boolean;
	createdAt: Date;
	updatedAt: Date;
	messages?: Message[];
};

export interface MessageFile {
	id: string;
	name: string;
	fileGroup: string;
}

export type Message = {
	id: string;
	chatId: string;
	role: "USER" | "ASSISTANT" | "SYSTEM";
	content: string;
	createdAt: Date;
	model: string;
	files?: MessageFile[];
};

export interface ChatState {
	messages: Message[];
	isChatLoading: boolean;
	isStreamingResponse: boolean;
	error: string | null;
}
