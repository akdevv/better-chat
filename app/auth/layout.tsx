import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IoIosArrowBack } from "react-icons/io";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="flex h-screen py-20 max-w-7xl mx-auto">
			<div className="hidden md:flex md:w-1/2 h-full p-5 relative">
				<Image
					src="/images/auth-cover.jpg"
					alt="Auth Background"
					width={1000}
					height={1000}
					priority={true}
					className="object-cover rounded-lg"
				/>
				<Button
					className="absolute top-8 right-8 rounded-full bg-transparent text-foreground/80 border-2 border-foreground/50 hover:bg-transparent hover:text-foreground/60 cursor-pointer"
					asChild
				>
					<Link href="/">
						<IoIosArrowBack />
						Back
					</Link>
				</Button>
			</div>
			<div className="flex-1 flex p-4 md:p-10 items-center justify-center">
				{children}
			</div>
		</main>
	);
}
