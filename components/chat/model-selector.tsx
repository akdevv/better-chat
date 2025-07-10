"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import {
	DEFAULT_MODEL,
	getModelById,
	groupModelsByProvider,
} from "@/lib/ai/models";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FiLock } from "react-icons/fi";
import { toast } from "sonner";
interface ModelSelectorProps {
	value: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	className?: string;
}

interface ModelStatus {
	id: string;
	name: string;
	provider: string;
	isFree: boolean;
	isEnabled: boolean;
}

export const ModelSelector = memo(
	({ value, onValueChange, disabled, className }: ModelSelectorProps) => {
		const router = useRouter();

		const [modelStatuses, setModelStatuses] = useState<ModelStatus[]>([]);
		const [isLoading, setIsLoading] = useState(false);
		const [lastFetch, setLastFetch] = useState<number>(0);

		const CACHE_DURATION = 5 * 60 * 1000;

		const fetchModelStatuses = useCallback(
			async (forceRefresh = false) => {
				const now = Date.now();

				// Use cache if still valid and not forced refresh
				if (
					!forceRefresh &&
					now - lastFetch < CACHE_DURATION &&
					modelStatuses.length > 0
				)
					return;

				try {
					setIsLoading(true);
					const res = await fetch("/api/keys/status");
					if (!res.ok) {
						throw new Error("Failed to fetch model status");
					}

					const data = await res.json();
					setModelStatuses(data);
					setLastFetch(now);
				} catch (error) {
					console.error("Error fetching model status:", error);
				} finally {
					setIsLoading(false);
				}
			},
			[modelStatuses.length, lastFetch]
		);

		const selectedModel =
			getModelById(value) || getModelById(DEFAULT_MODEL);
		const groupedModels = groupModelsByProvider();

		// Get status for a specific model
		const fetchModelStatus = useCallback(
			(modelId: string) => {
				return modelStatuses.find((status) => status.id === modelId);
			},
			[modelStatuses]
		);

		// Handle model selection
		const handleModelSelect = useCallback(
			(modelId: string) => {
				const modelStatus: ModelStatus | undefined =
					fetchModelStatus(modelId);

				if (!modelStatus) {
					toast.error("Model not found");
					return;
				}

				if (!modelStatus.isEnabled) {
					toast.error(
						`This model requires a valid ${modelStatus.provider} API key`
					);
					router.push("/settings/api-keys");
					return;
				}
				onValueChange?.(modelId);
			},
			[onValueChange, fetchModelStatus, router]
		);

		useEffect(() => {
			fetchModelStatuses();
		}, [fetchModelStatuses]);

		if (isLoading) {
			return (
				<div className="w-[140px] sm:w-[160px] h-8 animate-pulse rounded-md bg-muted" />
			);
		}

		return (
			<Select
				value={value}
				onValueChange={handleModelSelect}
				disabled={disabled}
			>
				<SelectTrigger
					className={cn(
						"w-[140px] sm:w-[160px] h-8",
						"border-border bg-background",
						"hover:bg-accent",
						"transition-colors duration-150",
						"text-sm font-medium",
						"focus:outline-none focus:ring-1 focus:ring-ring",
						"disabled:opacity-50 disabled:cursor-not-allowed",
						className
					)}
					tabIndex={-1}
				>
					<SelectValue>
						<div className="flex items-center gap-2">
							{selectedModel && (
								<span className="truncate">
									{selectedModel.name}
								</span>
							)}
						</div>
					</SelectValue>
				</SelectTrigger>

				<SelectContent className="min-w-[180px]">
					{Object.entries(groupedModels).map(([provider, models]) => (
						<SelectGroup key={provider}>
							<SelectLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
								{provider}
								{provider === "groq" && (
									<Badge
										variant="secondary"
										className="text-[10px] px-1.5 py-0"
									>
										Free
									</Badge>
								)}
							</SelectLabel>

							{models.map((model) => {
								const modelStatus = fetchModelStatus(model.id);
								const isEnabled =
									modelStatus?.isEnabled || model.isFree;

								return (
									<SelectItem
										key={model.id}
										value={model.id}
										className={cn(
											"text-sm cursor-pointer",
											!isEnabled &&
												"opacity-50 cursor-not-allowed"
										)}
										disabled={!isEnabled}
									>
										<div className="flex items-center justify-between w-full">
											<div className="flex items-center gap-2">
												{!model.isFree && (
													<FiLock className="h-3 w-3 text-muted-foreground" />
												)}
												<span>{model.name}</span>
											</div>

											{model.isNew && (
												<Badge
													variant="secondary"
													className="text-[10px] px-1.5 py-0"
												>
													New
												</Badge>
											)}
										</div>
									</SelectItem>
								);
							})}

							{provider !== "openai" && <SelectSeparator />}
						</SelectGroup>
					))}

					<SelectSeparator />

					<div className="flex items-center justify-center gap-1.5 p-2 text-xs text-muted-foreground">
						<FiLock className="h-3 w-3" />
						<span>Requires API key</span>
					</div>
				</SelectContent>
			</Select>
		);
	}
);
