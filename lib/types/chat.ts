export type Chat = {
	id: string;
	userId: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	messages: Message[];
};

export type Message = {
	id: string;
	chatId: string;
	role: "USER" | "ASSISTANT" | "SYSTEM";
	content: string;
	createdAt: Date;
	model: string;
};
