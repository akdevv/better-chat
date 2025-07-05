"use client";

import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useSidebarUI } from "@/components/sidebar";

export function NewChatButton() {
	const { collapsed, isMobile, closeMobileMenu } = useSidebarUI();

	const handleClick = () => {
		if (isMobile) closeMobileMenu();
	};

	return (
		<Link href="/chat" onClick={handleClick}>
			<Button
				className={`w-full gap-2 cursor-pointer ${
					collapsed && !isMobile ? "px-2" : ""
				}`}
				size={collapsed && !isMobile ? "icon" : "default"}
			>
				<FaPlus className="h-4 w-4 flex-shrink-0" />
				{!collapsed && "New Chat"}
			</Button>
		</Link>
	);
}
