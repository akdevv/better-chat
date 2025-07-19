"use client";

import { SidebarChat } from "@/lib/types/sidebar";
import { createContext, useContext } from "react";
import { useSidebarUI } from "@/hooks/use-sidebar-ui";
import { useSidebarData } from "@/hooks/use-sidebar-data";

interface SidebarContextValue {
	// Data
	chats: SidebarChat[];
	isLoading: boolean;
	totalCount: number;
	ITEMS_PER_PAGE: number;

	// UI
	isCollapsed: boolean;
	isMobile: boolean;
	isMobileMenuOpen: boolean;

	// Actions
	refresh: () => void;
	getCurrentChat: (chatId: string) => SidebarChat | undefined;
	renameChat: (chatId: string, newTitle: string) => void;
	toggleStar: (chatId: string) => void;
	deleteChat: (chatId: string) => void;
	addChat: (chat: SidebarChat) => void;
	generateTitle: (chatId: string, message: string) => void;

	// UI Actions
	toggleSidebar: () => void;
	closeMobileMenu: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(
	undefined
);

export function useSidebar() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within SidebarProvider");
	}
	return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const sidebarUI = useSidebarUI();
	const sidebarData = useSidebarData();

	const value: SidebarContextValue = {
		...sidebarUI,
		...sidebarData,
	};

	return (
		<SidebarContext.Provider value={value}>
			{children}
		</SidebarContext.Provider>
	);
}
