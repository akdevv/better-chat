import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiArrowRight } from "react-icons/hi";

export function CTA() {
	return (
		<section className="px-4 sm:px-6 lg:px-8 py-20">
			<div className="max-w-4xl mx-auto text-center">
				{/* Outer container with enhanced gradient border */}
				<div className="p-2 rounded-xl sm:rounded-2xl relative group bg-gradient-to-r from-primary/20 via-purple-500/15 to-blue-500/20">
					{/* Enhanced animated background with more gradient blobs */}
					<div className="absolute inset-0 z-0 transition-all duration-700 overflow-hidden rounded-xl">
						<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/8 via-purple-500/6 to-emerald-500/8" />
						<div className="absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-br from-violet-500/25 via-purple-600/20 to-indigo-500/15 rounded-full filter blur-2xl animate-pulse duration-4000" />
						<div className="absolute -bottom-12 -right-12 w-40 h-40 bg-gradient-to-br from-rose-500/25 via-pink-500/20 to-orange-400/15 rounded-full filter blur-xl animate-pulse duration-5000 delay-1000" />
						<div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-emerald-500/20 via-teal-400/15 to-cyan-400/18 rounded-full filter blur-lg animate-pulse duration-3500 delay-500" />
						<div className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-gradient-to-br from-amber-400/20 via-yellow-500/15 to-orange-500/12 rounded-full filter blur-lg animate-pulse duration-4500 delay-2000" />
						<div className="absolute top-1/4 left-1/6 w-28 h-28 bg-gradient-to-br from-blue-400/22 via-indigo-400/18 to-purple-400/15 rounded-full filter blur-md animate-pulse duration-3800 delay-700" />
						<div className="absolute bottom-1/4 right-1/6 w-24 h-24 bg-gradient-to-br from-fuchsia-400/25 via-pink-400/20 to-rose-400/15 rounded-full filter blur-md animate-pulse duration-4200 delay-1500" />
					</div>

					{/* Content Container with gradient border */}
					<div className="relative z-10 bg-card/95 backdrop-blur-xl border border-primary/20 rounded-lg sm:rounded-xl group-hover:backdrop-blur-2xl group-hover:bg-card transition-all duration-500 p-8 sm:p-12 bg-gradient-to-br from-card/98 to-card/95">
						<h2 className="text-3xl sm:text-4xl font-bold mb-4">
							Ready to Transform Your AI Experience?
						</h2>
						<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
							Join thousands of users who are already experiencing
							the future of AI conversations.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button asChild>
								<Link
									href="/auth/register"
									className="flex items-center gap-2"
								>
									Get Started Now
									<HiArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/auth/login">
									Already have an account?
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
