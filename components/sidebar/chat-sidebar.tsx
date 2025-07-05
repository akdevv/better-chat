"use client";

import {
	MobileSidebar,
	DesktopSidebar,
	useSidebarUI,
} from "@/components/sidebar";

const ChatSidebarContent = () => {
	const { isMobile } = useSidebarUI();
	return isMobile ? <MobileSidebar /> : <DesktopSidebar />;
};

export default function ChatSidebar() {
	return <ChatSidebarContent />;
}
