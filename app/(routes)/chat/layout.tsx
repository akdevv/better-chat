import {
	ChatSidebar,
	SidebarProvider,
	SidebarUIProvider,
} from "@/components/sidebar";
import { SidebarDebugProvider } from "@/components/sidebar/providers/_debug-provider";

export default function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarUIProvider>
			<SidebarProvider>
				<SidebarDebugProvider />
				<div className="h-screen w-screen flex">
					<ChatSidebar />
					<main className="flex-1 overflow-hidden">{children}</main>
				</div>
			</SidebarProvider>
		</SidebarUIProvider>
	);
}
