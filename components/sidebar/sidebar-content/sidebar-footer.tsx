"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useSidebarUI } from "@/components/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SidebarFooter() {
	const { data: session } = useSession();
	const { collapsed, isMobile, closeMobileMenu } = useSidebarUI();

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("");
	};

	return (
		<Link href="/settings/profile">
			<Button
				variant="ghost"
				className={`w-full h-auto p-2 cursor-pointer hover:bg-accent transition-colors ${
					collapsed && !isMobile ? "justify-center" : "justify-start"
				}`}
			>
				<div
					className={`flex items-center gap-3 ${
						collapsed && !isMobile ? "justify-center" : ""
					}`}
				>
					<Avatar className="h-8 w-8 flex-shrink-0">
						<AvatarImage
							src={session?.user?.image || ""}
							alt={session?.user?.name || "User avatar"}
						/>
						<AvatarFallback className="text-xs">
							{getInitials(session?.user?.name || "")}
						</AvatarFallback>
					</Avatar>

					{(!collapsed || isMobile) && (
						<div className="flex-1 min-w-0 text-left">
							<p className="text-sm font-medium truncate">
								{session?.user?.name || "User"}
							</p>
							<p className="text-xs text-muted-foreground truncate">
								{session?.user?.email || "user@example.com"}
							</p>
						</div>
					)}
				</div>
			</Button>
		</Link>
	);
}
