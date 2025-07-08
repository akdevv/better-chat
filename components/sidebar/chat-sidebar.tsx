"use client";

import { DesktopSidebar } from "./desktop-sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { useSidebar } from "@/contexts/sidebar-context";

export function ChatSidebar() {
	const { isMobile } = useSidebar();

	return isMobile ? <MobileSidebar /> : <DesktopSidebar />;
}
