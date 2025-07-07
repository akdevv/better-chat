"use client";

import Link from "next/link";
import { useSidebar } from "@/contexts/sidebar-context";
import { useSession } from "next-auth/react";

import { ChatList } from "./chat-list";
import { Button } from "@/components/ui/button";
import { GoPlus } from "react-icons/go";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SidebarContent() {
	const { isCollapsed } = useSidebar();
	const { data: session } = useSession();

	const getInitials = (name: string): string => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("");
	};

	return (
		<div className="flex flex-col h-screen">
			{/* New Chat Button */}
			<div
				className={`p-3 flex-shrink-0 ${
					isCollapsed && "flex flex-1 items-start justify-center"
				}`}
			>
				<Link href="/chat">
					<Button
						className={`cursor-pointer ${
							isCollapsed
								? "h-8 w-8 rounded-full"
								: "flex gap-2 w-full"
						}`}
					>
						<GoPlus className="h-4 w-4" />
						{!isCollapsed && "New Chat"}
					</Button>
				</Link>
			</div>

			{/* Chat List */}
			{!isCollapsed && (
				<div className="flex-1 min-h-0 max-h-[calc(100vh-200px)] overflow-y-auto">
					<ChatList />
				</div>
			)}

			{/* Footer */}
			<div className="p-3 border-t border-border">
				<Link href="/settings/profile">
					<Button
						variant="ghost"
						className={`w-full h-auto p-2 cursor-pointer hover:bg-accent transition-colors duration-300 ${
							isCollapsed ? "justify-center" : "justify-start"
						}`}
					>
						<Avatar className="h-8 w-8 flex-shrink-0">
							<AvatarImage
								src={session?.user?.image || ""}
								alt={session?.user?.name || ""}
							/>
							<AvatarFallback className="text-xs">
								{getInitials(session?.user?.name || "")}
							</AvatarFallback>
						</Avatar>

						{!isCollapsed && (
							<div className="flex-1 min-w-0 text-left">
								<p className="text-sm font-medium truncate">
									{session?.user?.name || "User"}
								</p>
								<p className="text-xs text-muted-foreground truncate">
									{session?.user?.email || "user@example.com"}
								</p>
							</div>
						)}
					</Button>
				</Link>
			</div>
		</div>
	);
}
