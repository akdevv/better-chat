import { LuLoaderCircle } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface SpinnerProps {
	size?: "sm" | "md" | "lg" | "xl";
	color?:
		| "primary"
		| "secondary"
		| "muted"
		| "destructive"
		| "white"
		| "dark";
	className?: string;
}

const sizeMap = {
	sm: "h-4 w-4",
	md: "h-6 w-6",
	lg: "h-8 w-8",
	xl: "h-12 w-12",
};

const colorMap = {
	primary: "text-primary",
	secondary: "text-secondary-foreground",
	muted: "text-muted-foreground",
	destructive: "text-destructive",
	white: "text-white",
	dark: "text-background",
};

export const Spinner = ({
	size = "md",
	color = "muted",
	className,
}: SpinnerProps) => {
	return (
		<div className="flex justify-center items-center h-full">
			<LuLoaderCircle
				className={cn(
					"animate-spin",
					sizeMap[size],
					colorMap[color],
					className,
				)}
			/>
		</div>
	);
};
