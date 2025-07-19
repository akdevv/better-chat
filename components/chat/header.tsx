"use client";

import { Button } from "@/components/ui/button";
import { MdOutlineIosShare } from "react-icons/md";
import { useSidebar } from "@/contexts/sidebar-context";
import { useParams } from "next/navigation";

export function Header() {
	const { getCurrentChat } = useSidebar();
	const { chatId } = useParams();

	const currentChat = chatId ? getCurrentChat(chatId as string) : null;
	const chatTitle = currentChat?.title;

	return (
		<header className="flex items-center justify-between px-4 py-3">
			<div className="flex-1 min-w-0">
				<h1 className="font-bold truncate text-foreground">
					{chatTitle}
				</h1>
			</div>
			<Button
				variant="outline"
				className="flex items-center gap-2 cursor-pointer"
			>
				<MdOutlineIosShare className="h-4 w-4" />
				Share
			</Button>
		</header>
	);
}
