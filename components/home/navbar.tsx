"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HiMenu, HiX } from "react-icons/hi";
import { useState } from "react";

export function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">
			<div className="bg-background/60 backdrop-blur-xl border border-border rounded-2xl shadow-lg shadow-black/5">
				<div className="px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-2">
							<div className="h-8 w-8 rounded-xl flex items-center justify-center">
								<Image 
									src="/logo.svg" 
									alt="Better Chat Logo" 
									width={32} 
									height={32} 
									className="h-8 w-8"
								/>
							</div>
							<span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Better Chat</span>
						</div>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center space-x-3">
							<Button variant="ghost" asChild className="hover:bg-primary/10 transition-colors duration-200">
								<Link href="/auth/login">Login</Link>
							</Button>
							<Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all duration-200">
								<Link href="/auth/register">Get Started</Link>
							</Button>
						</div>

						{/* Mobile menu button */}
						<div className="md:hidden">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="hover:bg-primary/10 transition-colors duration-200"
							>
								{mobileMenuOpen ? (
									<HiX className="h-5 w-5" />
								) : (
									<HiMenu className="h-5 w-5" />
								)}
							</Button>
						</div>
					</div>

					{/* Mobile Navigation */}
					{mobileMenuOpen && (
						<div className="md:hidden border-t border-border/40 bg-background/20 backdrop-blur-sm rounded-b-2xl -mx-6 lg:-mx-8">
							<div className="px-6 lg:px-8 pt-4 pb-6 space-y-3">
								<Button
									variant="ghost"
									asChild
									className="w-full justify-center hover:bg-primary/10 transition-colors duration-200"
								>
									<Link
										href="/auth/login"
										onClick={() => setMobileMenuOpen(false)}
									>
										Login
									</Link>
								</Button>
								<Button asChild className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md transition-all duration-200">
									<Link
										href="/auth/register"
										onClick={() => setMobileMenuOpen(false)}
									>
										Get Started
									</Link>
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}