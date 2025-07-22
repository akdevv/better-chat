"use client";

import { useSidebar } from "@/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import { GoSidebarCollapse } from "react-icons/go";
import { SidebarContent } from "./sidebar-content";
import { FaRegMessage, FaXmark } from "react-icons/fa6";

export function MobileSidebar() {
	const { isMobileMenuOpen, toggleSidebar } = useSidebar();

	if (!isMobileMenuOpen) {
		return (
			<Button
				variant="ghost"
				size="icon"
				onClick={toggleSidebar}
				className="fixed top-4 left-4 z-50 h-10 w-10 bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card cursor-pointer"
				data-sidebar-trigger
			>
				<GoSidebarCollapse className="h-5 w-5" />
			</Button>
		);
	}

	return (
		<>
			{/* Mobile Overlay */}
			<div
				className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-300"
				onClick={toggleSidebar}
			/>

			{/* Mobile Sidebar */}
			<div
				className="fixed top-0 left-0 z-50 w-72 h-full border-r border-border bg-sidebar flex flex-col transform translate-x-0 transition-transform duration-300 ease-out"
				data-sidebar
			>
				{/* Header */}
				<div className="flex items-center justify-between p-3 border-b border-border">
					<div className="flex items-center gap-2">
						<FaRegMessage className="h-4 w-4 text-primary" />
						<span className="font-bold text-primary">BetterChat</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleSidebar}
						className="h-8 w-8 p-0 cursor-pointer"
					>
						<FaXmark className="h-4 w-4" />
					</Button>
				</div>

				{/* Sidebar Content */}
				<SidebarContent />
			</div>
		</>
	);
}
