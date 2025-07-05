"use client";

import { useEffect } from "react";
import {
	SidebarHeader,
	SidebarToggle,
	NewChatButton,
	SidebarFooter,
	ChatList,
} from "@/components/sidebar/sidebar-content";
import { useSidebarUI } from "@/components/sidebar";

export function MobileSidebar() {
	const { isMobileMenuOpen, closeMobileMenu } = useSidebarUI();

	// close mobile menu when clicking outside
	useEffect(() => {
		if (!isMobileMenuOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;
			if (
				!target.closest("[data-sidebar]") &&
				!target.closest("[data-sidebar-trigger]")
			) {
				closeMobileMenu();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [isMobileMenuOpen, closeMobileMenu]);

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [isMobileMenuOpen]);

	// Mobile menu trigger (only visible on mobile)
	if (!isMobileMenuOpen) {
		return <SidebarToggle />;
	}

	return (
		<>
			{/* Mobile overlay background */}
			<div
				className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-300"
				onClick={closeMobileMenu}
			/>

			{/* Mobile Sidebar */}
			<div
				className="fixed top-0 left-0 z-50 w-72 h-full border-r border-border bg-sidebar flex flex-col transform translate-x-0 transition-transform duration-300 ease-out"
				data-sidebar
			>
				{/* Header */}
				<div className="flex items-center justify-between p-3 border-b border-border">
					<SidebarHeader />
					<SidebarToggle />
				</div>

				{/* New chat button */}
				<div className="p-3">
					<NewChatButton />
				</div>

				{/* Chat list */}
				<div className="flex-1 px-3">
					<ChatList />
				</div>

				{/* Footer */}
				<div className="p-3 border-t border-border">
					<SidebarFooter />
				</div>
			</div>
		</>
	);
}
