export interface SidebarChat {
	id: string;
	title: string;
	isStarred: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface SidebarChatResponse {
	chats: SidebarChat[];
	pagination: {
		limit: number;
		offset: number;
		total: number;
	};
}
