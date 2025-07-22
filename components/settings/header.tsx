"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export default function Header() {
	const pathname = usePathname();
	
	const pageNames = {
		profile: "Profile",
		appearance: "Appearance",
		"api-keys": "API Keys",
		tools: "Tools",
		integrations: "Integrations",
	};

	const currentPage = pathname.split("/").pop() || "";
	const displayName = pageNames[currentPage as keyof typeof pageNames] || currentPage;

	return (
		<header className="border-b border-border/60">
			<div className="flex items-center p-4 gap-6">
				<Button
					variant="ghost"
					size="icon"
					asChild
					className="bg-accent/40 hover:bg-accent/60 rounded-full"
				>
					<Link href="/chat">
						<ArrowLeftIcon className="w-4 h-4" />
					</Link>
				</Button>
				<h1>
					<span className="text-lg font-semibold">Settings / </span>
					<span className="text-md text-muted-foreground">
						{displayName}
					</span>
				</h1>
			</div>
		</header>
	);
}
