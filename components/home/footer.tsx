import Link from "next/link";
import Image from "next/image";

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-muted/30 border-t">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
					<div className="flex items-center space-x-2">
						<div className="h-6 w-6 rounded-md flex items-center justify-center">
							<Image 
								src="/logo.svg" 
								alt="Better Chat Logo" 
								width={24} 
								height={24} 
								className="h-6 w-6"
							/>
						</div>
						<span className="text-lg font-bold">Better Chat</span>
					</div>

					<div className="flex items-center space-x-6 text-sm text-muted-foreground">
						<Link
							href="#"
							className="hover:text-foreground transition-colors"
						>
							Privacy
						</Link>
						<Link
							href="#"
							className="hover:text-foreground transition-colors"
						>
							Terms
						</Link>
						<Link
							href="#"
							className="hover:text-foreground transition-colors"
						>
							Support
						</Link>
					</div>

					<p className="text-sm text-muted-foreground">
						© {currentYear} Better Chat. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}