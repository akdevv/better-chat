"use client";
import { useState, useEffect } from "react";

import { FiSidebar } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { FaRegMessage, FaPlus, FaXmark } from "react-icons/fa6";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ChatSidebar({
	collapsed,
	onToggle,
}: {
	collapsed: boolean;
	onToggle: () => void;
}) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

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

	const user = {
		name: "John Doe",
		email: "john@example.com",
		avatar: null,
	};

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
					<Button
						className={`w-full gap-2 cursor-pointer ${
							collapsed && !isMobile ? "px-2" : ""
						}`}
					>
						<FaPlus />
						{(!collapsed || isMobile) && "New Chat"}
					</Button>
				</div>

				{/* chat list */}
				<div className="flex-1 px-3">
					{(!collapsed || isMobile) && (
						<div>
							<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider my-2">
								Recent Chats
							</h3>
							<ScrollArea className="h-full">
								<div className="space-y-1"></div>
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
							<AvatarImage src="https://github.com/shadcn.png" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
						{(!collapsed || isMobile) && (
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">
									{user?.name}
								</p>
								<p className="text-xs text-muted-foreground truncate">
									{user?.email}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuItem,
// 	DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
// 	MessageCircle,
// 	Plus,
// 	MoreHorizontal,
// 	Edit,
// 	Star,
// 	Trash2,
// 	Menu,
// 	User,
// } from "lucide-react";

// interface Chat {
// 	id: string;
// 	name: string;
// 	lastMessage?: string;
// 	timestamp?: string;
// }

// interface SidebarChatPreviewProps {
// 	chat: Chat;
// 	collapsed: boolean;
// }

// function SidebarChatPreview({ chat, collapsed }: SidebarChatPreviewProps) {
// 	const [isHovered, setIsHovered] = useState(false);

// 	return (
// 		<div
// 			className={`group relative flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
// 				collapsed ? "justify-center" : ""
// 			}`}
// 			onMouseEnter={() => setIsHovered(true)}
// 			onMouseLeave={() => setIsHovered(false)}
// 		>
// 			<MessageCircle className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
// 			{!collapsed && (
// 				<>
// 					<div className="flex-1 min-w-0">
// 						<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
// 							{chat.name}
// 						</p>
// 						{chat.lastMessage && (
// 							<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
// 								{chat.lastMessage}
// 							</p>
// 						)}
// 					</div>
// 					{isHovered && (
// 						<DropdownMenu>
// 							<DropdownMenuTrigger asChild>
// 								<Button
// 									variant="ghost"
// 									size="sm"
// 									className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
// 								>
// 									<MoreHorizontal className="h-3 w-3" />
// 								</Button>
// 							</DropdownMenuTrigger>
// 							<DropdownMenuContent align="end" className="w-40">
// 								<DropdownMenuItem>
// 									<Edit className="h-3 w-3 mr-2" />
// 									Rename
// 								</DropdownMenuItem>
// 								<DropdownMenuItem>
// 									<Star className="h-3 w-3 mr-2" />
// 									Star
// 								</DropdownMenuItem>
// 								<DropdownMenuItem className="text-red-600 dark:text-red-400">
// 									<Trash2 className="h-3 w-3 mr-2" />
// 									Delete
// 								</DropdownMenuItem>
// 							</DropdownMenuContent>
// 						</DropdownMenu>
// 					)}
// 				</>
// 			)}
// 		</div>
// 	);
// }

// export default function ChatSidebar({
// 	collapsed,
// 	onToggle,
// }: {
// 	collapsed: boolean;
// 	onToggle: () => void;
// }) {
// 	// Mock data for demonstration
// 	const chats: Chat[] = [
// 		{
// 			id: "1",
// 			name: "Project Discussion",
// 			lastMessage: "Let's discuss the new features...",
// 			timestamp: "2m ago",
// 		},
// 		{
// 			id: "2",
// 			name: "Team Meeting Notes",
// 			lastMessage: "Action items from today's meeting",
// 			timestamp: "1h ago",
// 		},
// 		{
// 			id: "3",
// 			name: "Code Review",
// 			lastMessage: "Please review the PR when you get a chance",
// 			timestamp: "3h ago",
// 		},
// 		{
// 			id: "4",
// 			name: "Bug Report Analysis",
// 			lastMessage: "Found the root cause of the issue",
// 			timestamp: "1d ago",
// 		},
// 		{
// 			id: "5",
// 			name: "Feature Planning",
// 			lastMessage: "Let's plan the next sprint",
// 			timestamp: "2d ago",
// 		},
// 	];

// 	const user = {
// 		name: "John Doe",
// 		email: "john@example.com",
// 		avatar: null,
// 	};

// 	return (
// 		<div
// 			className={`h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ${
// 				collapsed ? "w-16" : "w-80"
// 			}`}
// 		>
// 			{/* Header with Logo and Toggle */}
// 			<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
// 				{!collapsed && (
// 					<div className="flex items-center gap-2">
// 						<MessageCircle className="h-6 w-6 text-blue-600" />
// 						<span className="font-bold text-lg text-gray-900 dark:text-gray-100">
// 							BetterChat
// 						</span>
// 					</div>
// 				)}
// 				<Button
// 					variant="ghost"
// 					size="sm"
// 					onClick={onToggle}
// 					className={`h-8 w-8 p-0 ${collapsed ? "mx-auto" : ""}`}
// 				>
// 					<Menu className="h-4 w-4" />
// 				</Button>
// 			</div>

// 			{/* New Chat Button */}
// 			<div className="p-4">
// 				<Button
// 					className={`w-full gap-2 ${
// 						collapsed ? "px-2" : ""
// 					} bg-blue-600 hover:bg-blue-700 text-white`}
// 					size={collapsed ? "sm" : "default"}
// 				>
// 					<Plus className="h-4 w-4" />
// 					{!collapsed && "New Chat"}
// 				</Button>
// 			</div>

// 			{/* Chat List */}
// 			<div className="flex-1 px-4">
// 				{!collapsed && (
// 					<h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
// 						Recent Chats
// 					</h3>
// 				)}
// 				<ScrollArea className="h-full">
// 					<div className="space-y-1">
// 						{chats.map((chat) => (
// 							<SidebarChatPreview
// 								key={chat.id}
// 								chat={chat}
// 								collapsed={collapsed}
// 							/>
// 						))}
// 					</div>
// 				</ScrollArea>
// 			</div>

// 			{/* User Profile */}
// 			<div className="p-4 border-t border-gray-200 dark:border-gray-800">
// 				<div
// 					className={`flex items-center gap-3 ${
// 						collapsed ? "justify-center" : ""
// 					}`}
// 				>
// 					<div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
// 						<User className="h-4 w-4 text-white" />
// 					</div>
// 					{!collapsed && (
// 						<div className="flex-1 min-w-0">
// 							<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
// 								{user.name}
// 							</p>
// 							<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
// 								{user.email}
// 							</p>
// 						</div>
// 					)}
// 				</div>
// 			</div>
// 		</div>
// 	);
// }
