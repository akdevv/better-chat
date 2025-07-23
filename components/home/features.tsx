import { Card } from "@/components/ui/card";
import {
	HiChatAlt2,
	HiSparkles,
	HiLightningBolt,
	HiShieldCheck,
	HiDocumentText,
} from "react-icons/hi";
import { HiCommandLine } from "react-icons/hi2";

const features = [
	{
		icon: HiChatAlt2,
		title: "Multi-Model Support",
		description:
			"Access multiple AI models including GPT-4, Claude, and Gemini all in one place.",
	},
	{
		icon: HiCommandLine,
		title: "MCP Tools Integration",
		description:
			"Connect with external tools and services through Model Context Protocol for enhanced functionality.",
	},
	{
		icon: HiSparkles,
		title: "Custom Agents",
		description:
			"Create and deploy custom AI agents tailored to your specific needs and workflows.",
	},
	{
		icon: HiLightningBolt,
		title: "Lightning Fast",
		description:
			"Optimized for speed with real-time responses and seamless user experience.",
	},
	{
		icon: HiShieldCheck,
		title: "Secure & Private",
		description:
			"Your conversations are encrypted and stored securely with enterprise-grade security.",
	},
	{
		icon: HiDocumentText,
		title: "File Upload & Analysis",
		description:
			"Upload and analyze documents, images, and files with intelligent AI-powered insights and processing.",
	},
];

export function Features() {
	return (
		<section className="px-4 sm:px-6 lg:px-8 py-24">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-20">
					<h2 className="text-3xl sm:text-4xl font-bold mb-6">
						Powerful Features
					</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Everything you need for advanced AI conversations and
						more
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => {
						const Icon = feature.icon;
						return (
							<Card
								key={index}
								className="p-8 hover:shadow-lg transition-all duration-300 group border-muted bg-gradient-to-br from-muted/20 to-muted/40 hover:from-muted/30 hover:to-muted/50"
							>
								<div className="flex flex-col">
									<div className="flex items-start space-x-5">
										<div className="p-3 bg-gradient-to-br from-muted/40 to-muted/60 rounded-xl group-hover:from-muted/50 group-hover:to-muted/70 transition-all duration-300 shrink-0">
											<Icon className="h-6 w-6 text-foreground/80" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold text-lg mb-3">
												{feature.title}
											</h3>
										</div>
									</div>
									<p className="text-muted-foreground leading-relaxed pl-14">
										{feature.description}
									</p>
								</div>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
}
