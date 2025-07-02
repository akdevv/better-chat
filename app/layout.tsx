import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
	title: "Better Chat",
	description:
		"AI chat app with multiple models, MCP tools, and custom agents",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`antialiased dark`}>
				<SessionProvider>{children}</SessionProvider>
				<Toaster />
			</body>
		</html>
	);
}
