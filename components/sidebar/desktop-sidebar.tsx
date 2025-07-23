"use client";

import Image from "next/image";
import { useSidebar } from "@/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import { SidebarContent } from "./sidebar-content";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";

export function DesktopSidebar() {
	const { isCollapsed, toggleSidebar } = useSidebar();

	return (
		<div
			className={`flex flex-col h-full border-r border-border bg-sidebar transform transition-transform duration-300 ease-out ${
				isCollapsed ? "w-16" : "w-72"
			}`}
			data-sidebar
		>
			{/* Header */}
			<div className="flex items-center justify-between p-3 border-b border-border">
				{!isCollapsed && (
					<div className="flex items-center gap-2">
						<Image
							src="/logo.svg"
							alt="Better Chat Logo"
							width={16}
							height={16}
							className="h-4 w-4"
						/>
						<span className="font-bold text-primary">
							BetterChat
						</span>
					</div>
				)}

				<Button
					variant="ghost"
					size="icon"
					onClick={toggleSidebar}
					className={`group`}
				>
					{isCollapsed ? (
						<>
							<Image
								src="/logo.svg"
								alt="Better Chat Logo"
								width={16}
								height={16}
								className="h-4 w-4 group-hover:hidden transition-all duration-300"
							/>
							<GoSidebarCollapse className="h-4 w-4 hidden group-hover:block transition-all duration-300" />
						</>
					) : (
						<GoSidebarExpand className="h-4 w-4 duration-300" />
					)}
				</Button>
			</div>

			{/* Sidebar Content */}
			<SidebarContent />
		</div>
	);
}
