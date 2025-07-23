import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BiMessageSquareError } from "react-icons/bi";
import { HiPlus, HiHome } from "react-icons/hi";

export default function ChatNotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="text-center space-y-8 max-w-lg mx-auto px-6">
				<div className="space-y-4">
					<div className="flex justify-center">
						<BiMessageSquareError className="h-16 w-16 text-muted-foreground/60" />
					</div>
					<div className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tight">Chat Not Found</h1>
						<p className="text-muted-foreground text-lg leading-relaxed">
							This conversation doesn&apos;t exist or may have been deleted. Start a new chat or explore your existing conversations.
						</p>
					</div>
				</div>
				
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button asChild className="gap-2">
						<Link href="/chat">
							<HiPlus className="h-4 w-4" />
							Start New Chat
						</Link>
					</Button>
					<Button variant="outline" asChild className="gap-2">
						<Link href="/">
							<HiHome className="h-4 w-4" />
							Go Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}