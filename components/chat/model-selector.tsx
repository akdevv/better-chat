"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState, useRef } from "react";
import {
	DEFAULT_MODEL,
	getModelById,
	groupModelsByProvider,
	modelSupportsVision,
	modelSupportsThinking,
} from "@/lib/ai/models";

import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { FiLock, FiChevronDown } from "react-icons/fi";
import { LuEye, LuBrain } from "react-icons/lu";
import { toast } from "sonner";

const MODEL_CACHE_KEY = "selected-model";

// Helper functions for model caching
const getCachedModel = (): string | null => {
	if (typeof window === "undefined") return null;
	try {
		return localStorage.getItem(MODEL_CACHE_KEY);
	} catch (error) {
		console.error("Error reading cached model:", error);
		return null;
	}
};

const setCachedModel = (modelId: string): void => {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(MODEL_CACHE_KEY, modelId);
	} catch (error) {
		console.error("Error caching model:", error);
	}
};

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
		const dropdownRef = useRef<HTMLDivElement>(null);
		const [isInitialized, setIsInitialized] = useState(false);

		const [modelStatuses, setModelStatuses] = useState<ModelStatus[]>([]);
		const [isLoading, setIsLoading] = useState(false);
		const [lastFetch, setLastFetch] = useState<number>(0);
		const [isOpen, setIsOpen] = useState(false);

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
			[modelStatuses.length, lastFetch, CACHE_DURATION],
		);

		useEffect(() => {
			if (!isInitialized) {
				const cachedModelId = getCachedModel();
				if (cachedModelId && getModelById(cachedModelId)) {
					if (cachedModelId !== value) {
						onValueChange?.(cachedModelId);
					}
				}
				setIsInitialized(true);
			}
		}, [isInitialized, value, onValueChange]);

		const selectedModel = getModelById(value) || getModelById(DEFAULT_MODEL);
		const groupedModels = groupModelsByProvider();

		// Get status for a specific model
		const fetchModelStatus = useCallback(
			(modelId: string) => {
				return modelStatuses.find((status) => status.id === modelId);
			},
			[modelStatuses],
		);

		// Handle model selection
		const handleModelSelect = useCallback(
			(modelId: string) => {
				const modelStatus: ModelStatus | undefined = fetchModelStatus(modelId);

				if (!modelStatus) {
					toast.error("Model not found");
					return;
				}

				if (!modelStatus.isEnabled) {
					toast.error(
						`This model requires a valid ${modelStatus.provider} API key`,
					);
					router.push("/settings/api-keys");
					return;
				}

				// Cache the selected model
				setCachedModel(modelId);
				onValueChange?.(modelId);
				setIsOpen(false);
			},
			[onValueChange, fetchModelStatus, router],
		);

		// Close dropdown when clicking outside
		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					dropdownRef.current &&
					!dropdownRef.current.contains(event.target as Node)
				) {
					setIsOpen(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}, []);

		useEffect(() => {
			fetchModelStatuses();
		}, [fetchModelStatuses]);

		if (isLoading || !isInitialized) {
			return (
				<div className="w-[140px] sm:w-[160px] h-9 animate-pulse rounded-md bg-muted" />
			);
		}

		return (
			<div className="relative" ref={dropdownRef}>
				{/* Trigger */}
				<button
					type="button"
					onClick={() => !disabled && setIsOpen(!isOpen)}
					disabled={disabled}
					className={cn(
						"w-[180px] h-9 px-3",
						"border border-border bg-muted rounded-md",
						"hover:bg-muted/80",
						"transition-colors duration-150",
						"text-sm font-medium",
						"focus:outline-none focus:ring-1 focus:ring-ring",
						"disabled:opacity-50 disabled:cursor-not-allowed",
						"flex items-center justify-between cursor-pointer",
						className,
					)}
				>
					<div className="flex items-center gap-2 justify-between w-full">
						{selectedModel && (
							<>
								<span className="truncate">{selectedModel.name}</span>
								<div className="flex items-center gap-1">
									{modelSupportsVision(selectedModel.id) && (
										<div className="flex items-center justify-center w-4 h-4 p-0.5 bg-green-100/15 rounded-sm">
											<LuEye className="h-2.5 w-2.5 text-green-600/80" />
										</div>
									)}

									{modelSupportsThinking(selectedModel.id) && (
										<div className="flex items-center justify-center w-4 h-4 p-0.5 bg-pink-100/15 rounded-sm">
											<LuBrain className="h-2.5 w-2.5 text-pink-600/80" />
										</div>
									)}
								</div>
							</>
						)}
					</div>
					<FiChevronDown
						className={cn(
							"h-3 w-3 text-muted-foreground transition-transform duration-150 ml-1",
							isOpen && "rotate-180",
						)}
					/>
				</button>

				{/* Dropdown */}
				{isOpen && (
					<div className="absolute bottom-full left-0 z-50 mb-1 min-w-[220px] max-h-80 bg-background border border-border rounded-md shadow-lg overflow-hidden">
						<div className="max-h-72 overflow-y-auto">
							{Object.entries(groupedModels).map(
								([provider, models], providerIndex) => (
									<div key={provider}>
										{/* Provider Header */}
										<div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase border-b border-border/50 bg-muted/30">
											{provider}
											{provider === "groq" && (
												<Badge
													variant="secondary"
													className="text-[10px] px-1.5 py-0"
												>
													Free
												</Badge>
											)}
										</div>

										{/* Models */}
										{models.map((model) => {
											const modelStatus = fetchModelStatus(model.id);
											const isEnabled = modelStatus?.isEnabled || model.isFree;
											const isSelected = model.id === value;

											return (
												<button
													key={model.id}
													type="button"
													onClick={() => handleModelSelect(model.id)}
													disabled={!isEnabled}
													className={cn(
														"w-full px-3 py-2.5 text-sm text-left",
														"hover:bg-accent transition-colors",
														"disabled:opacity-50 disabled:cursor-not-allowed",
														isSelected && "bg-accent/50",
													)}
												>
													<div className="flex items-center justify-between w-full">
														<div className="flex items-center gap-2">
															{!model.isFree && (
																<FiLock className="h-3 w-3 text-muted-foreground" />
															)}
															<span>{model.name}</span>
														</div>

														{/* Vision and Thinking indicators on the right */}
														<div className="flex items-center gap-1.5">
															{modelSupportsVision(model.id) && (
																<TooltipProvider>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<div className="flex items-center justify-center w-5 h-5 p-1 bg-green-100/10 rounded-md">
																				<LuEye className="h-3 w-3 text-green-600/60" />
																			</div>
																		</TooltipTrigger>
																		<TooltipContent className="bg-muted border-muted-foreground/20 text-xs">
																			<p className="text-muted-foreground">
																				Vision model
																			</p>
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>
															)}

															{modelSupportsThinking(model.id) && (
																<TooltipProvider>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<div className="flex items-center justify-center w-5 h-5 p-1 bg-pink-100/10 rounded-md">
																				<LuBrain className="h-3 w-3 text-pink-600/60" />
																			</div>
																		</TooltipTrigger>
																		<TooltipContent className="bg-muted border-muted-foreground/20 text-xs">
																			<p className="text-muted-foreground">
																				Thinking model
																			</p>
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>
															)}
														</div>
													</div>
												</button>
											);
										})}

										{/* Separator between providers (except for the last one) */}
										{providerIndex <
											Object.entries(groupedModels).length - 1 && (
											<div className="border-t border-border/50" />
										)}
									</div>
								),
							)}
						</div>

						{/* Footer */}
						<div className="border-t border-border/50 bg-muted/30">
							<div className="flex items-center justify-center gap-1.5 p-2 text-xs text-muted-foreground">
								<FiLock className="h-3 w-3" />
								<span>Requires API key</span>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	},
);

ModelSelector.displayName = "ModelSelector";
