"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	useSettingsContext,
	type Theme,
	type AccentColor,
	type Font,
} from "@/contexts/settings-context";
import { cn } from "@/lib/utils";
import {
	IoSunnyOutline,
	IoMoonOutline,
	IoDesktopOutline,
	IoCheckmarkCircle,
	IoCheckmark,
} from "react-icons/io5";

const themes: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
	{
		value: "light",
		label: "Light",
		icon: <IoSunnyOutline className="w-4 h-4" />,
	},
	{
		value: "dark",
		label: "Dark",
		icon: <IoMoonOutline className="w-4 h-4" />,
	},
	{
		value: "system",
		label: "System",
		icon: <IoDesktopOutline className="w-4 h-4" />,
	},
];

const accentColors: Array<{
	value: AccentColor;
	label: string;
	color: string;
}> = [
	{ value: "blue", label: "Blue", color: "bg-blue-500" },
	{ value: "green", label: "Green", color: "bg-green-500" },
	{ value: "purple", label: "Purple", color: "bg-purple-500" },
	{ value: "orange", label: "Orange", color: "bg-orange-500" },
	{ value: "red", label: "Red", color: "bg-red-500" },
];

const fonts: Array<{ value: Font; label: string }> = [
	{ value: "Inter", label: "Inter" },
	{ value: "Syne", label: "Syne" },
	{ value: "Roboto", label: "Roboto" },
	{ value: "Outfit", label: "Outfit" },
	{ value: "Poppins", label: "Poppins" },
];

function ThemePreview({ themeType }: { themeType: Theme }) {
	if (themeType === "system") {
		return (
			<div className="h-20 rounded-lg border overflow-hidden flex">
				{/* Light half */}
				<div
					className="flex-1 relative"
					style={{ backgroundColor: "oklch(0.9821 0 0)" }}
				>
					<div
						className="h-4"
						style={{
							backgroundColor: "oklch(0.3732 0.0328 41.8087)",
						}}
					></div>
					<div className="p-2 space-y-1.5">
						<div
							className="h-2 rounded"
							style={{
								backgroundColor: "oklch(0.2435 0 0)",
								width: "75%",
								opacity: 0.8,
							}}
						></div>
						<div
							className="h-2 rounded"
							style={{
								backgroundColor: "oklch(0.2435 0 0)",
								width: "50%",
								opacity: 0.6,
							}}
						></div>
					</div>
				</div>
				{/* Dark half */}
				<div
					className="flex-1 relative"
					style={{ backgroundColor: "oklch(0.1776 0 0)" }}
				>
					<div
						className="h-4"
						style={{
							backgroundColor: "oklch(0.8225 0.1276 63.3087)",
						}}
					></div>
					<div className="p-2 space-y-1.5">
						<div
							className="h-2 rounded"
							style={{
								backgroundColor: "oklch(0.9491 0 0)",
								width: "75%",
								opacity: 0.9,
							}}
						></div>
						<div
							className="h-2 rounded"
							style={{
								backgroundColor: "oklch(0.9491 0 0)",
								width: "50%",
								opacity: 0.7,
							}}
						></div>
					</div>
				</div>
			</div>
		);
	}

	if (themeType === "dark") {
		return (
			<div
				className="h-20 rounded-lg border relative overflow-hidden"
				style={{ backgroundColor: "oklch(0.1776 0 0)" }}
			>
				<div
					className="h-4"
					style={{ backgroundColor: "oklch(0.8225 0.1276 63.3087)" }}
				></div>
				<div className="p-2 space-y-1.5">
					<div
						className="h-2 rounded"
						style={{
							backgroundColor: "oklch(0.9491 0 0)",
							width: "75%",
							opacity: 0.9,
						}}
					></div>
					<div
						className="h-2 rounded"
						style={{
							backgroundColor: "oklch(0.9491 0 0)",
							width: "50%",
							opacity: 0.7,
						}}
					></div>
				</div>
			</div>
		);
	}

	// Light theme
	return (
		<div
			className="h-20 rounded-lg border relative overflow-hidden"
			style={{ backgroundColor: "oklch(0.9821 0 0)" }}
		>
			<div
				className="h-4"
				style={{ backgroundColor: "oklch(0.3732 0.0328 41.8087)" }}
			></div>
			<div className="p-2 space-y-1.5">
				<div
					className="h-2 rounded"
					style={{
						backgroundColor: "oklch(0.2435 0 0)",
						width: "75%",
						opacity: 0.8,
					}}
				></div>
				<div
					className="h-2 rounded"
					style={{
						backgroundColor: "oklch(0.2435 0 0)",
						width: "50%",
						opacity: 0.6,
					}}
				></div>
			</div>
		</div>
	);
}

export default function AppearancePage() {
	const { theme, accentColor, font, setTheme, setAccentColor, setFont } =
		useSettingsContext();

	return (
		<div className="space-y-8">
			{/* Theme Section */}
			<div className="space-y-6">
				<div>
					<h2 className="text-xl font-semibold">Theme</h2>
					<p className="text-sm text-muted-foreground">
						Select your UI theme
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{themes.map((themeOption) => (
						<div key={themeOption.value} className="space-y-3">
							<Card
								className={cn(
									"cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden",
									theme === themeOption.value
										? "ring-2 ring-primary border-primary"
										: "hover:border-muted-foreground/50",
								)}
								onClick={() => setTheme(themeOption.value)}
							>
								<CardContent className="p-4">
									<ThemePreview
										themeType={themeOption.value}
									/>
								</CardContent>
							</Card>

							<div className="flex items-center gap-3 justify-center">
								{theme === themeOption.value && (
									<IoCheckmarkCircle className="w-5 h-5 text-primary" />
								)}
								{themeOption.icon}
								<span className="font-medium">
									{themeOption.label}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>

			<Separator />

			{/* Accent Color Section */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold">Accent Color</h2>
						<p className="text-sm text-muted-foreground">
							Choose your accent color
						</p>
					</div>

					<div className="flex gap-4">
						{accentColors.map((colorOption) => (
							<button
								key={colorOption.value}
								onClick={() =>
									setAccentColor(colorOption.value)
								}
								className={cn(
									"relative w-12 h-12 rounded-full transition-all duration-200",
									accentColor === colorOption.value
										? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
										: "hover:scale-105",
								)}
								title={colorOption.label}
							>
								<div
									className={cn(
										"w-full h-full rounded-full",
										colorOption.color,
									)}
								/>
								{accentColor === colorOption.value && (
									<IoCheckmark className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white" />
								)}
							</button>
						))}
					</div>
				</div>
			</div>

			<Separator />

			{/* Font Section */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold">Font</h2>
						<p className="text-sm text-muted-foreground">
							Select your preferred font
						</p>
					</div>

					<div className="w-48">
						<Select
							value={font}
							onValueChange={(value: Font) => setFont(value)}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{fonts.map((fontOption) => (
									<SelectItem
										key={fontOption.value}
										value={fontOption.value}
										style={{ fontFamily: fontOption.value }}
									>
										{fontOption.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
		</div>
	);
}
