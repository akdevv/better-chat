"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarChat } from "@/lib/types/sidebar";
import { ChatDropdown } from "./chat-dropdown";

export function ChatItem({ chat }: { chat: SidebarChat }) {
	const pathname = usePathname();
	const [menuOpen, setMenuOpen] = useState(false);

	const isActive = pathname === `/chat/${chat.id}`;
	const isGeneratingTitle = chat.title === "Untitled Chat";

	return (
		<Link
			href={`/chat/${chat.id}`}
			className={`group relative flex items-center gap-3 px-2 rounded-lg cursor-pointer transition-colors hover:bg-accent min-h-[40px] ${
				isActive ? "bg-accent/50" : "hover:bg-accent"
			}`}
		>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium font-accent-foreground truncate">
					{isGeneratingTitle ? "Generating..." : chat.title}
				</p>
				{/* {isGeneratingTitle && (
					<div className="flex items-center space-x-1">
						<div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
						<div
							className="w-1 h-1 bg-current rounded-full animate-bounce"
							style={{ animationDelay: "0.1s" }}
						></div>
						<div
							className="w-1 h-1 bg-current rounded-full animate-bounce"
							style={{ animationDelay: "0.2s" }}
						></div>
					</div>
				)} */}
			</div>
			{!isGeneratingTitle && (
				<ChatDropdown
					chat={chat}
					isOpen={menuOpen}
					onOpenChange={setMenuOpen}
				/>
			)}
		</Link>
	);
}
