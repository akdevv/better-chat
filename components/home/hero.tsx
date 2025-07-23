import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiArrowRight, HiSparkles } from "react-icons/hi";

export function Hero() {
	return (
		<section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
			{/* Gradient Background */}
			<div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
			
			{/* Multiple gradient orbs using primary colors */}
			<div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
			<div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/8 to-transparent rounded-full blur-3xl" />
			
			{/* Center large gradient */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/12 via-primary/8 to-primary/6 rounded-full blur-3xl" />
			
			{/* Additional surrounding gradients */}
			<div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-primary/6 to-transparent rounded-full blur-2xl" />
			<div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-tl from-primary/7 to-transparent rounded-full blur-2xl" />
			<div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-t from-primary/5 to-transparent rounded-full blur-2xl" />
			<div className="absolute top-1/2 right-0 w-56 h-56 bg-gradient-to-l from-primary/6 to-transparent rounded-full blur-2xl" />
			<div className="absolute top-1/2 left-0 w-48 h-48 bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-2xl" />

			<div className="max-w-7xl mx-auto text-center z-10">
				<div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
					{/* New Features Chip */}
					<div className="inline-flex items-center gap-2 px-4 py-2 mb-2 text-xs font-medium bg-primary/5 border border-primary/10 rounded-full text-primary/80">
						<HiSparkles className="h-3 w-3" />
						New Features Coming Soon
					</div>

					<h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-8">
						The Future of
						<span className="block sm:inline sm:ml-3 bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
							AI Conversations
						</span>
					</h1>

					<p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
						Experience the next generation of AI chat with multiple
						models, custom agents, and powerful tool integrations.
						All in one beautiful, fast, and secure platform.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Button
							size="lg"
							asChild
							className="group relative h-14 px-8 sm:px-10 text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary hover:via-primary/95 hover:to-primary/80 w-full sm:w-auto overflow-hidden"
						>
							<Link
								href="/auth/register"
								className="flex items-center justify-center gap-3 relative z-10"
							>
								<div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								Start Chatting Free
								<HiArrowRight className="h-5 w-5 transition-all duration-500 group-hover:translate-x-1 group-hover:scale-110" />
							</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							asChild
							className="group h-14 px-8 sm:px-10 text-lg font-semibold rounded-xl border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg transition-all duration-300 w-full sm:w-auto backdrop-blur-sm"
						>
							<Link href="/auth/login" className="group-hover:text-primary transition-colors duration-300">
								Sign In
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
