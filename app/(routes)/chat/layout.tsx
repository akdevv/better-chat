"use client";

import { useState } from "react";
import ChatSidebar from "@/components/chat/chat-sidebar";

export default function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	return (
		<div className="h-screen w-screen flex">
			<ChatSidebar
				collapsed={sidebarCollapsed}
				onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
			/>
			<main className="flex-1 overflow-hidden">{children}</main>
		</div>
	);
}
