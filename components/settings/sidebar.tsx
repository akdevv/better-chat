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
		<div className="h-full flex-col p-6 transition-all duration-300 w-64 hidden md:flex">
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
									isActive && "bg-accent/30"
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

// "use client";

// import { cn } from "@/lib/utils";
// import { ScrollArea } from "@radix-ui/react-scroll-area";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { User, Palette, Key, Wrench, Plug } from "lucide-react";

// const settingsNavigation = [
// 	{
// 		title: "Profile",
// 		href: "/settings/profile",
// 		icon: User,
// 		description: "Manage your account information",
// 	},
// 	{
// 		title: "Appearance",
// 		href: "/settings/appearance",
// 		icon: Palette,
// 		description: "Customize your interface",
// 	},
// 	{
// 		title: "API Keys",
// 		href: "/settings/api-keys",
// 		icon: Key,
// 		description: "Connect to AI providers",
// 	},
// 	{
// 		title: "Tools",
// 		href: "/settings/tools",
// 		icon: Wrench,
// 		description: "Manage available tools",
// 	},
// 	{
// 		title: "Integrations",
// 		href: "/settings/integrations",
// 		icon: Plug,
// 		description: "Connect external services",
// 	},
// ];

// export default function Sidebar({

// 	}: {
// }) {
// 	const pathname = usePathname();

// 	return (
// 		<div
// 			className={cn(
// 				"h-full flex flex-col border-r border-border transition-all duration-300 md:w-72 md:block",
// 				isSidebarOpen ? "w-72 block" : "w-0 hidden"
// 			)}
// 		>
// 			<ScrollArea className="">
// 				<div className="p-6 space-y-10">
// 					{settingsNavigation.map((item) => {
// 						const isActive =
// 							pathname === item.href ||
// 							pathname.startsWith(item.href + "/");
// 						const Icon = item.icon;

// 						return (
// 							<Link key={item.href} href={item.href}>
// 								<div
// 									className={cn(
// 										"flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent",
// 										isActive && "bg-accent"
// 									)}
// 								>
// 									<Icon
// 										className={cn(
// 											"h-5 w-5 mt-0.5",
// 											isActive
// 												? "text-accent-foreground"
// 												: "text-muted-foreground"
// 										)}
// 									/>
// 									<div className="space-y-1">
// 										<p
// 											className={cn(
// 												"text-sm font-medium",
// 												isActive
// 													? "text-accent-foreground"
// 													: "text-foreground"
// 											)}
// 										>
// 											{item.title}
// 										</p>
// 										<p className="text-xs text-muted-foreground">
// 											{item.description}
// 										</p>
// 									</div>
// 								</div>
// 							</Link>
// 						);
// 					})}
// 				</div>
// 			</ScrollArea>
// 		</div>
// 	);
// }
