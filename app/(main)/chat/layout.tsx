import { ChatProvider } from "@/contexts/chat-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ChatSidebar } from "@/components/sidebar/chat-sidebar";

export default function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ChatProvider>
			<SidebarProvider>
				<div className="flex h-screen w-screen">
					<ChatSidebar />
					<main className="flex-1 overflow-hidden">{children}</main>
				</div>
			</SidebarProvider>
		</ChatProvider>
	);
}
