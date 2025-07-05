import { FaXmark } from "react-icons/fa6";
import { FiSidebar } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useSidebarUI } from "@/components/sidebar";

export function SidebarToggle() {
	const { collapsed, isMobile, isMobileMenuOpen, toggleSidebar } =
		useSidebarUI();

	// Mobile trigger button (shows when menu is closed)
	if (isMobile && !isMobileMenuOpen) {
		return (
			<Button
				variant="ghost"
				size="icon"
				onClick={toggleSidebar}
				className="fixed top-4 left-4 z-50 h-10 w-10 bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card cursor-pointer"
				data-sidebar-trigger
			>
				<FiSidebar className="h-5 w-5" />
			</Button>
		);
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleSidebar}
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
	);
}
