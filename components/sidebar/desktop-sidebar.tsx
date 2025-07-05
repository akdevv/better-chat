"use client";

import {
	SidebarHeader,
	SidebarToggle,
	NewChatButton,
	ChatList,
	SidebarFooter,
} from "@/components/sidebar/sidebar-content";
import { useSidebarUI } from "@/components/sidebar";

export function DesktopSidebar() {
	const { collapsed } = useSidebarUI();

	return (
		<div
			className={`h-full border-r border-border bg-sidebar flex flex-col transition-[width] duration-300 ease-out ${
				collapsed ? "w-16" : "w-72"
			}`}
			data-sidebar
		>
			{/* Header */}
			<div className="flex items-center justify-between p-3 border-b border-border">
				<SidebarHeader />
				<SidebarToggle />
			</div>

			{/* New chat button */}
			<div className="p-3">
				<NewChatButton />
			</div>

			{/* Chat list */}
			<div className="flex-1 px-3 max-h-[calc(100vh-10rem)] overflow-y-auto">
				{!collapsed && <ChatList />}
			</div>

			{/* Footer */}
			<div className="p-3 border-t border-border">
				<SidebarFooter />
			</div>
		</div>
	);
}
