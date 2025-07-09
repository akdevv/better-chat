"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const settingsNavigation = [
	{ title: "Profile", href: "/settings/profile" },
	{ title: "Appearance", href: "/settings/appearance" },
	{ title: "API Keys", href: "/settings/api-keys" },
	{ title: "Tools", href: "/settings/tools" },
	{ title: "Integrations", href: "/settings/integrations" },
];

export default function Sidebar() {
	const pathname = usePathname();

	return (
		<div className="sticky top-0 h-full flex-col p-6 transition-all duration-300 w-64 hidden md:flex">
			{settingsNavigation.map((item) => {
				const isActive =
					pathname === item.href ||
					pathname.startsWith(item.href + "/");

				return (
					<div key={item.title} className="mb-1">
						<Link href={item.href}>
							<div
								className={cn(
									"p-3 transition-colors hover:bg-accent rounded-lg",
									isActive && "bg-accent/30",
								)}
							>
								{item.title}
							</div>
						</Link>
					</div>
				);
			})}
		</div>
	);
}
