"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarChat } from "@/lib/types/sidebar";
import { useSidebar } from "@/contexts/sidebar-context";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { RenameDialog } from "@/components/shared/rename-dialog";
import { RxDotsHorizontal } from "react-icons/rx";
import { RiEditLine } from "react-icons/ri";
import { FaStar, FaRegStar } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";

export function ChatDropdown({
	chat,
	isOpen,
	onOpenChange,
}: {
	chat: SidebarChat;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const router = useRouter();
	const { deleteChat, renameChat, toggleStar } = useSidebar();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);
	const [isStarring, setIsStarring] = useState(false);

	const handleDelete = useCallback(async () => {
		setIsDeleting(true);

		try {
			await deleteChat(chat.id);
			toast.success("Chat deleted successfully");
			setDeleteDialogOpen(false);

			// If we're currently viewing this chat, redirect to home
			if (window.location.pathname === `/chat/${chat.id}`) {
				router.push("/chat");
			}
		} catch (error) {
			console.error("Failed to delete chat:", error);
			toast.error("Failed to delete chat. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	}, [chat.id, deleteChat, router]);

	const handleRename = useCallback(
		async (newTitle: string) => {
			if (newTitle === chat.title) {
				setRenameDialogOpen(false);
				return;
			}

			setIsRenaming(true);

			try {
				await renameChat(chat.id, newTitle);
				toast.success("Chat renamed successfully");
				setRenameDialogOpen(false);
			} catch (error) {
				console.error("Failed to rename chat:", error);
				toast.error("Failed to rename chat. Please try again.");
			} finally {
				setIsRenaming(false);
			}
		},
		[chat.id, chat.title, renameChat]
	);

	const handleToggleStar = useCallback(async () => {
		setIsStarring(true);

		try {
			await toggleStar(chat.id);
			toast.success(chat.isStarred ? "Chat unstarred" : "Chat starred");
		} catch (error) {
			console.error("Failed to toggle star:", error);
			toast.error("Failed to update star status. Please try again.");
		} finally {
			setIsStarring(false);
		}
	}, [chat.id, chat.isStarred, toggleStar]);

	return (
		<>
			<DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className={`h-6 w-6 p-0 cursor-pointer transition-opacity focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
							isOpen
								? "opacity-100"
								: "opacity-0 group-hover:opacity-100"
						}`}
						onClick={(e) => {
							e.stopPropagation();
							onOpenChange(!isOpen);
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

				<DropdownMenuContent
					align="end"
					className="w-40"
					onClick={(e) => e.preventDefault()}
				>
					{/* Rename */}
					<DropdownMenuItem
						onClick={() => setRenameDialogOpen(true)}
						disabled={isRenaming}
					>
						<RiEditLine className="h-3 w-3 mr-2" />
						Rename
					</DropdownMenuItem>

					{/* Star */}
					<DropdownMenuItem
						onClick={handleToggleStar}
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

					{/* Delete */}
					<DropdownMenuItem
						onClick={() => setDeleteDialogOpen(true)}
						disabled={isDeleting}
						className="text-red-400 hover:!text-red-400 hover:!bg-red-900/30"
					>
						<MdDeleteOutline className="h-3 w-3 mr-2 text-red-400" />
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
