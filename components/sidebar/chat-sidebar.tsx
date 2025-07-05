"use client";

import {
	MobileSidebar,
	DesktopSidebar,
	SidebarProvider,
	useSidebarUI,
	SidebarUIProvider,
} from "@/components/sidebar";

import { SidebarDebugProvider } from "@/components/sidebar/providers/_debug-provider";

const ChatSidebarContent = () => {
	const { isMobile } = useSidebarUI();
	return isMobile ? <MobileSidebar /> : <DesktopSidebar />;
};

export default function ChatSidebar() {
	return (
		<SidebarUIProvider>
			<SidebarProvider>
				<SidebarDebugProvider />
				<ChatSidebarContent />
			</SidebarProvider>
		</SidebarUIProvider>
	);
}
