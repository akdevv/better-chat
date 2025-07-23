import { Navbar } from "@/components/home/navbar";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { CTA } from "@/components/home/cta";
import { Footer } from "@/components/home/footer";

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<Hero />
			<Features />
			<CTA />
			<Footer />
		</div>
	);
}
