"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { TbSend, TbCoin } from "react-icons/tb";
import { IoRefreshOutline } from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileStats {
	totalChats: number;
	totalMessages: number;
	estimatedTokens: number;
}

interface StatCardProps {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	value: string;
	label: string;
	color: string;
	isLoading?: boolean;
}

function StatCard({
	icon: IconComponent,
	value,
	label,
	color,
	isLoading,
}: StatCardProps) {
	if (isLoading) {
		return (
			<Card className="p-4 bg-background border-border/50">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-muted/50">
						<div className="h-5 w-5 bg-muted-foreground/20 rounded animate-pulse" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-7 w-14 bg-muted/60" />
						<Skeleton className="h-3 w-20 bg-muted/40" />
					</div>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-4 bg-background border-border/50">
			<div className="flex items-center gap-3">
				<div className={`p-2 rounded-lg ${color}`}>
					<IconComponent className="h-5 w-5" />
				</div>
				<div className="space-y-0.5">
					<p className="text-2xl font-bold">{value}</p>
					<p className="text-sm text-muted-foreground">{label}</p>
				</div>
			</div>
		</Card>
	);
}

function formatNumber(num: number): string {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + "M";
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + "k";
	}
	return num.toString();
}

export default function ProfileStats() {
	const [stats, setStats] = useState<ProfileStats | null>(null);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchStats = async (forceRefresh = false) => {
		try {
			if (forceRefresh) {
				setIsRefreshing(true);
			} else {
				setIsInitialLoading(true);
			}
			setError(null);

			const url = forceRefresh
				? "/api/profile/stats?refresh=true"
				: "/api/profile/stats";

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error("Failed to fetch stats");
			}

			const data = await response.json();
			setStats(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsInitialLoading(false);
			setIsRefreshing(false);
		}
	};

	useEffect(() => {
		fetchStats();
	}, []);

	const handleRefresh = () => {
		fetchStats(true);
	};

	const statItems = stats
		? [
				{
					icon: HiOutlineChatBubbleLeftRight,
					value: formatNumber(stats.totalChats),
					label: "Total Chats",
					color: "bg-blue-500",
				},
				{
					icon: TbSend,
					value: formatNumber(stats.totalMessages),
					label: "Messages Sent",
					color: "bg-green-500",
				},
				{
					icon: TbCoin,
					value: formatNumber(stats.estimatedTokens),
					label: "Tokens Used",
					color: "bg-purple-500",
				},
			]
		: [];

	if (error) {
		return (
			<div className="space-y-4 mt-10">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Usage Statistics</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRefresh}
						disabled={isRefreshing}
						className="cursor-pointer gap-1 h-8 px-2 text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/30 transition-all text-xs opacity-70 hover:opacity-100"
					>
						<IoRefreshOutline
							className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
						/>
						{isRefreshing ? "Refreshing..." : "Refresh"}
					</Button>
				</div>
				<Card className="p-4 bg-background border-border/50">
					<p className="text-sm text-muted-foreground">
						Error loading stats: {error}
					</p>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-4 mt-10">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Usage Statistics</h2>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleRefresh}
					disabled={isRefreshing}
					className="cursor-pointer gap-1 h-8 px-2 text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/30 transition-all text-xs opacity-70 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
				>
					<IoRefreshOutline
						className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
					/>
					{isRefreshing ? "Refreshing..." : "Refresh"}
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{isInitialLoading
					? [...Array(3)].map((_, index) => (
							<StatCard
								key={index}
								icon={HiOutlineChatBubbleLeftRight}
								value=""
								label=""
								color="bg-gray-300"
								isLoading={true}
							/>
						))
					: statItems.map((stat, index) => (
							<StatCard
								key={index}
								icon={stat.icon}
								value={stat.value}
								label={stat.label}
								color={stat.color}
								isLoading={false}
							/>
						))}
			</div>
		</div>
	);
}
