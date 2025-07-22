"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MessagesSkeleton() {
	return (
		<div className="p-4 max-w-3xl mx-auto w-full space-y-6">
			{/* User message skeleton */}
			<div className="flex justify-end">
				<div className="max-w-[80%] space-y-2">
					<Skeleton className="h-4 w-48 bg-muted/30" />
					<Skeleton className="h-4 w-36 bg-muted/30" />
				</div>
			</div>

			{/* AI message skeleton */}
			<div className="flex justify-start">
				<div className="w-full space-y-2">
					<Skeleton className="h-4 w-full bg-muted/20" />
					<Skeleton className="h-4 w-[85%] bg-muted/20" />
					<Skeleton className="h-4 w-[92%] bg-muted/20" />
					<Skeleton className="h-4 w-[78%] bg-muted/20" />
				</div>
			</div>

			{/* User message skeleton */}
			<div className="flex justify-end">
				<div className="max-w-[80%] space-y-2">
					<Skeleton className="h-4 w-44 bg-muted/30" />
				</div>
			</div>

			{/* AI message skeleton */}
			<div className="flex justify-start">
				<div className="w-full space-y-2">
					<Skeleton className="h-4 w-[95%] bg-muted/20" />
					<Skeleton className="h-4 w-[88%] bg-muted/20" />
					<Skeleton className="h-4 w-[76%] bg-muted/20" />
				</div>
			</div>

			{/* User message skeleton */}
			<div className="flex justify-end">
				<div className="max-w-[80%] space-y-2">
					<Skeleton className="h-4 w-52 bg-muted/30" />
					<Skeleton className="h-4 w-32 bg-muted/30" />
				</div>
			</div>
		</div>
	);
}
