export type SidebarChat = {
	id: string;
	title: string;
	isStarred: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export interface SidebarChatResponse {
	chats: SidebarChat[];
	pagination: {
		limit: number;
		offset: number;
		total: number;
	};
}

export type SidebarContextType = {
	// data
	chats: SidebarChat[];
	isLoading: boolean;
	isLoadingMore: boolean;
	hasMore: boolean;

	// functions
	fetchChats: (loadMore?: boolean) => Promise<void>;
	handleChatDelete: (chatId: string) => void;
	handleChatUpdate: (updatedChat: SidebarChat) => void;
	handleChatRefresh: () => void;
	loadMoreChats: () => void;
};

export type SidebarUIContextType = {
	collapsed: boolean;
	isMobile: boolean;
	isMobileMenuOpen: boolean;
	toggleSidebar: () => void;
	setSidebarCollapsed: (newCollapsed: boolean) => void;
	closeMobileMenu: () => void;
	openMobileMenu: () => void;
};
