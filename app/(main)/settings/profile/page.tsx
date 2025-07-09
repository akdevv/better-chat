"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { TbSend, TbCoin } from "react-icons/tb";
import { MdDeleteOutline } from "react-icons/md";
import { IoIosWarning } from "react-icons/io";

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

	// Placeholder usage statistics
	const usageStats = [
		{
			icon: HiOutlineChatBubbleLeftRight,
			value: "127",
			label: "Total Chats",
			color: "bg-blue-500",
		},
		{
			icon: TbSend,
			value: "2,341",
			label: "Messages Sent",
			color: "bg-green-500",
		},
		{
			icon: TbCoin,
			value: "8.2k",
			label: "Tokens Used",
			color: "bg-purple-500",
		},
	];

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
			<div className="space-y-4 mt-10">
				<h2 className="text-xl font-semibold">Usage Statistics</h2>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{usageStats.map((stat, index) => {
						const IconComponent = stat.icon;
						return (
							<Card
								key={index}
								className="p-4 bg-background border-border/50"
							>
								<div className="flex items-center gap-3">
									<div
										className={`p-2 rounded-lg ${stat.color}`}
									>
										<IconComponent className="h-5 w-5" />
									</div>
									<div className="space-y-0.5">
										<p className="text-2xl font-bold">
											{stat.value}
										</p>
										<p className="text-sm text-muted-foreground">
											{stat.label}
										</p>
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			</div>

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
