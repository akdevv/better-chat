import ChatSidebar from "@/components/sidebar/chat-sidebar";

export default function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="h-screen w-screen flex">
			<ChatSidebar />
			<main className="flex-1 overflow-hidden">{children}</main>
		</div>
	);
}
