"use client";

import { FaRegMessage } from "react-icons/fa6";
import { useSidebarUI } from "@/components/sidebar";

export function SidebarHeader() {
	const { collapsed, isMobile } = useSidebarUI();

	return (
		<>
			{(isMobile || !collapsed) && (
				<div className="flex items-center gap-2">
					<FaRegMessage className="h-4 w-4 text-primary flex-shrink-0" />
					<span className="font-bold text-primary truncate">
						BetterChat
					</span>
				</div>
			)}
		</>
	);
}
