"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChatSidebarItem } from "@/lib/types/chat";
import { usePathname, useRouter } from "next/navigation";

import { FiSidebar } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { FaRegMessage, FaPlus, FaXmark } from "react-icons/fa6";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import ChatDropdownMenu from "./chat-dropdown-menu";

interface ChatsResponse {
	chats: ChatSidebarItem[];
	pagination: {
		limit: number;
		offset: number;
		total: number;
	};
}

const ChatPreview = ({
	chat,
	onChatDelete,
}: {
	chat: ChatSidebarItem;
	onChatDelete: (updatedChat: ChatSidebarItem) => void;
}) => {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<Link
			href={`/chat/${chat.id}`}
			className="group relative flex items-center gap-3 px-2 rounded-lg cursor-pointer transition-colors hover:bg-accent min-h-[40px]"
		>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium font-accent-foreground truncate">
					{chat.title}
				</p>
			</div>
			<ChatDropdownMenu
				chat={chat}
				onChatUpdate={() => {}}
				onChatDelete={() => onChatDelete(chat)}
				menuOpen={menuOpen}
				setMenuOpen={setMenuOpen}
			/>
		</Link>
	);
};

export default function ChatSidebar({
	collapsed,
	onToggle,
}: {
	collapsed: boolean;
	onToggle: () => void;
}) {
	const router = useRouter();
	const pathname = usePathname();

	const { data: session } = useSession();

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [chats, setChats] = useState<ChatSidebarItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [offset, setOffset] = useState(0);

	const LIMIT = 50;

	const handleChatDelete = (updatedChat: ChatSidebarItem) => {
		setChats((prevChats) => {
			const updatedChats = prevChats.map((chat) =>
				chat.id === updatedChat.id ? updatedChat : chat
			);
			return updatedChats.sort((a, b) => {
				// First, sort by starred status (starred chats first)
				if (a.isStarred !== b.isStarred) {
					return a.isStarred ? -1 : 1;
				}
				// Then sort by updatedAt (most recent first)
				return (
					new Date(b.updatedAt).getTime() -
					new Date(a.updatedAt).getTime()
				);
			});
		});
	};

	const fetchChats = async (loadMore: boolean = false) => {
		const currentOffset = loadMore ? offset : 0;
		const loading = loadMore ? setIsLoadingMore : setIsLoading;

		loading(true);

		try {
			const res = await fetch(
				`/api/chats?limit=${LIMIT}&offset=${currentOffset}`
			);

			if (!res.ok) {
				throw new Error("Failed to fetch chats");
			}

			const data: ChatsResponse = await res.json();

			if (loadMore) {
				// append new chats to existing chats
				setChats((prevChats) => [...prevChats, ...data.chats]);
			} else {
				// set chats to new chats
				setChats(data.chats);
			}

			// update pagination
			setOffset(currentOffset + LIMIT);
			setHasMore(data.chats.length === LIMIT);
		} catch (error) {
			console.error("Error fetching chats: ", error);
			setHasMore(false);
		} finally {
			loading(false);
		}
	};

	useEffect(() => {
		fetchChats();
	}, []);

	// Check if we're on mobile
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768); // md breakpoint
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Close mobile menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isMobile && isMobileMenuOpen) {
				const target = event.target as Element;
				if (
					!target.closest("[data-sidebar]") &&
					!target.closest("[data-sidebar-trigger]")
				) {
					setIsMobileMenuOpen(false);
				}
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [isMobile, isMobileMenuOpen]);

	const handleMobileToggle = () => {
		if (isMobile) {
			setIsMobileMenuOpen(!isMobileMenuOpen);
		} else {
			onToggle();
		}
	};

	// Mobile menu trigger (only visible on mobile)
	if (isMobile && !isMobileMenuOpen) {
		return (
			<Button
				variant="ghost"
				size="icon"
				onClick={handleMobileToggle}
				className="fixed top-4 left-4 z-50 h-10 w-10 bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card md:hidden"
				data-sidebar-trigger
			>
				<FiSidebar className="h-5 w-5" />
			</Button>
		);
	}

	// Desktop sidebar or mobile overlay
	return (
		<>
			{/* Mobile overlay background */}
			{isMobile && isMobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-300"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`h-full border-r border-border bg-sidebar flex flex-col transform transition-transform duration-300 ease-out ${
					isMobile
						? `fixed top-0 left-0 z-50 w-72 ${
								isMobileMenuOpen
									? "translate-x-0"
									: "-translate-x-full"
						  } md:relative md:translate-x-0 md:transform-none md:transition-[width]`
						: `relative transition-[width] ${
								collapsed ? "w-16" : "w-72"
						  }`
				}`}
				data-sidebar
			>
				{/* header */}
				<div className="flex items-center justify-between p-3 border-b border-border">
					{(!collapsed || isMobile) && (
						<div className="flex items-center gap-2">
							<FaRegMessage className="h-4 w-4 text-primary" />
							<span className="font-bold text-primary">
								BetterChat
							</span>
						</div>
					)}
					<Button
						variant="ghost"
						size="icon"
						onClick={handleMobileToggle}
						className={`h-8 w-8 p-0 cursor-pointer ${
							collapsed && !isMobile ? "mx-auto" : ""
						}`}
					>
						{isMobile && isMobileMenuOpen ? (
							<FaXmark className="h-4 w-4" />
						) : (
							<FiSidebar className="h-4 w-4" />
						)}
					</Button>
				</div>

				{/* new chat button */}
				<div className="p-3">
					<Link href="/chat">
						<Button
							className={`w-full gap-2 cursor-pointer ${
								collapsed && !isMobile ? "px-2" : ""
							}`}
						>
							<FaPlus />
							{(!collapsed || isMobile) && "New Chat"}
						</Button>
					</Link>
				</div>

				{/* chat list */}
				<div className="flex-1 px-3">
					{(!collapsed || isMobile) && (
						<div>
							<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider my-2">
								Recent Chats
							</h3>
							<ScrollArea className="h-full">
								<div className="space-y-0.5">
									{isLoading && (
										<div className="space-y-1">
											{Array.from({ length: 5 }).map(
												(_, index) => (
													<Skeleton
														key={index}
														className="h-10 w-full animate-pulse"
													/>
												)
											)}
										</div>
									)}
									{chats.map((chat) => (
										<ChatPreview
											key={chat.id}
											chat={chat}
											onChatDelete={handleChatDelete}
										/>
									))}
								</div>

								{!isLoading && hasMore && (
									<div className="flex justify-center mt-3">
										<Button
											variant="secondary"
											className="cursor-pointer"
											onClick={() => {
												fetchChats();
											}}
										>
											{isLoadingMore
												? "Loading..."
												: "Load More"}
										</Button>
									</div>
								)}
							</ScrollArea>
						</div>
					)}
				</div>

				{/* user profile */}
				<div className="p-3 border-t border-border">
					<div
						className={`flex items-center gap-3 ${
							collapsed && !isMobile ? "justify-center" : ""
						}`}
					>
						<Avatar>
							<AvatarImage src={session?.user?.image || ""} />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
						{(!collapsed || isMobile) && (
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">
									{session?.user?.name}
								</p>
								<p className="text-xs text-muted-foreground truncate">
									{session?.user?.email}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}