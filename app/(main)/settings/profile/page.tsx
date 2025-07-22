"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MdDeleteOutline } from "react-icons/md";
import { IoIosWarning } from "react-icons/io";
import ProfileStats from "@/components/profile/profile-stats";

export default function ProfilePage() {
	const { data: session } = useSession();

	const getInitials = (name: string): string => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const handleSignOut = () => {
		signOut({ callbackUrl: "/auth/login" });
	};

	return (
		<div className="space-y-4">
			{/* Profile Header */}
			<Card className="p-6 bg-background">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Avatar className="h-16 w-16">
							<AvatarImage
								src={session?.user?.image || ""}
								alt={session?.user?.name || ""}
							/>
							<AvatarFallback className="text-xl font-semibold">
								{getInitials(session?.user?.name || "User")}
							</AvatarFallback>
						</Avatar>

						<div className="space-y-1">
							<h1 className="text-2xl font-bold">
								{session?.user?.name}
							</h1>
							<p className="text-base text-muted-foreground">
								{session?.user?.email}
							</p>
							<p className="text-sm text-muted-foreground">
								Member since {formatDate("2024-01-15")}
							</p>
						</div>
					</div>

					<Button
						variant="outline"
						onClick={handleSignOut}
						className="cursor-pointer"
					>
						Logout
					</Button>
				</div>
			</Card>

			{/* Usage Statistics */}
			<ProfileStats />

			{/* Danger Zone */}
			<Card className="p-4 bg-background border-border/50">
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-full bg-accent/50">
							<IoIosWarning className="h-4 w-4" />
						</div>
						<h3 className="text-base font-medium">Danger Zone</h3>
					</div>
					<p className="text-sm text-muted-foreground">
						This will permanently delete your account and all of its
						data. This action cannot be undone.
					</p>
					<Button variant="outline" className="cursor-pointer">
						<MdDeleteOutline className="h-4 w-4" />
						Delete My Account
					</Button>
				</div>
			</Card>
		</div>
	);
}
