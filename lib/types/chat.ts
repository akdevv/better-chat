export type Chat = {
	id: string;
	userId: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	messages: Message[];
};

export type ChatSidebarItem = {
	id: string;
	title: string;
	isStarred: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type Message = {
	id: string;
	chatId: string;
	role: "USER" | "ASSISTANT" | "SYSTEM";
	content: string;
	createdAt: Date;
	model: string;
};
