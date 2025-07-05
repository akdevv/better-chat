"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { FiSidebar } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import ChatList from "./chat-list";
import { FaRegMessage, FaPlus, FaXmark } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ChatSidebar({
	collapsed,
	onToggle,
}: {
	collapsed: boolean;
	onToggle: () => void;
}) {
	const { data: session } = useSession();

	const [isMobile, setIsMobile] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
				<ChatList collapsed={collapsed} isMobile={isMobile} />

				{/* user profile */}
				<div className="p-3 border-t border-border">
					<div
						className={`flex items-center gap-3 ${
							collapsed && !isMobile ? "justify-center" : ""
						}`}
					>
						<Avatar>
							<AvatarImage src={session?.user?.image || ""} />
							<AvatarFallback>
								{session?.user?.name
									?.split(" ")
									.map((n) => n[0])
									.join("")}
							</AvatarFallback>
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
