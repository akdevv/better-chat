"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatSidebarItem } from "@/lib/types/chat";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RenameDialog } from "@/components/ui/rename-dialog";
import { RxDotsHorizontal } from "react-icons/rx";
import { RiEditLine } from "react-icons/ri";
import { FaStar } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";

interface ChatDropdownMenuProps {
	chat: ChatSidebarItem;
	onChatUpdate: (updatedChat: ChatSidebarItem) => void;
	onChatDelete: (chatId: string) => void;
	menuOpen: boolean;
	setMenuOpen: (open: boolean) => void;
}

export default function ChatDropdownMenu({
	chat,
	onChatUpdate,
	onChatDelete,
	menuOpen,
	setMenuOpen,
}: ChatDropdownMenuProps) {
	const router = useRouter();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);
	const [isStarring, setIsStarring] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);

		try {
			const res = await fetch(`/api/chats/${chat.id}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				throw new Error("Failed to delete chat");
			}

			onChatDelete(chat.id);
			toast.success("Chat deleted successfully");
			setDeleteDialogOpen(false);

			if (window.location.pathname === `/chat/${chat.id}`) {
				router.push("/chat");
			}
		} catch (error) {
			console.error("Error deleting chat: ", error);
			toast.error("Failed to delete chat");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleRename = async (newTitle: string) => {
		setIsRenaming(true);

		try {
			const res = await fetch(`/api/chats/${chat.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},

				body: JSON.stringify({ action: "rename", title: newTitle }),
			});

			if (!res.ok) {
				throw new Error("Failed to rename chat");
			}

			const updatedChat = await res.json();
			onChatUpdate(updatedChat);
			toast.success("Chat renamed successfully");
			setRenameDialogOpen(false);
		} catch (error) {
			console.error("Error renaming chat: ", error);
			toast.error("Failed to rename chat");
		} finally {
			setIsRenaming(false);
		}
	};

	const handleToggleStar = async () => {
		setIsStarring(true);

		try {
			const res = await fetch(`/api/chats/${chat.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ action: "toggle_star" }),
			});

			if (!res.ok) {
				throw new Error("Failed to toggle star");
			}

			const updatedChat = await res.json();
			onChatUpdate(updatedChat);
			toast.success(`Chat ${chat.isStarred ? "unstarred" : "starred"}`);
		} catch (error) {
			console.error("Error toggling star: ", error);
			toast.error("Failed to toggle star");
		} finally {
			setIsStarring(false);
		}
	};

	return (
		<>
			<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className={`h-6 w-6 p-0 cursor-pointer transition-opacity focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
							menuOpen
								? "opacity-100"
								: "opacity-0 group-hover:opacity-100"
						}`}
						onClick={(e) => {
							e.stopPropagation();
							setMenuOpen(!menuOpen);
						}}
						onMouseDown={(e) => e.stopPropagation()}
						aria-label="Chat options"
						style={{
							outline: "none",
							boxShadow: "none",
						}}
					>
						<RxDotsHorizontal className="h-3 w-3" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-40">
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							setMenuOpen(false);
							setRenameDialogOpen(true);
						}}
					>
						<RiEditLine className="h-3 w-3 mr-2" />
						Rename
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							setMenuOpen(false);
							handleToggleStar();
						}}
						disabled={isStarring}
					>
						{chat.isStarred ? (
							<FaStar className="h-3 w-3 mr-2" />
						) : (
							<FaRegStar className="h-3 w-3 mr-2" />
						)}
						{isStarring
							? "..."
							: chat.isStarred
							? "Unstar"
							: "Star"}
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							setMenuOpen(false);
							setDeleteDialogOpen(true);
						}}
					>
						<MdDeleteOutline className="h-3 w-3 mr-2" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDelete}
				title="Delete Chat"
				description={`Are you sure you want to delete "${chat.title}"? This action cannot be undone.`}
				confirmText="Delete"
				isLoading={isDeleting}
			/>

			<RenameDialog
				open={renameDialogOpen}
				onOpenChange={setRenameDialogOpen}
				onConfirm={handleRename}
				currentTitle={chat.title}
				isLoading={isRenaming}
			/>
		</>
	);
}
