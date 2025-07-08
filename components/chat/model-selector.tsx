"use client";

import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
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
interface ModelSelectorProps {
	value: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	className?: string;
}

export const ModelSelector = memo(
	({ value, onValueChange, disabled, className }: ModelSelectorProps) => {
		const router = useRouter();
		const selectedModel =
			getModelById(value) || getModelById(DEFAULT_MODEL);
		const groupedModels = groupModelsByProvider();

		const handleModelSelect = useCallback(
			(modelId: string) => {
				const model = getModelById(modelId);

				if (model && !model.isFree) {
					router.push(`/settings/api-keys`);
					return;
				}
				onValueChange?.(modelId);
			},
			[onValueChange, router]
		);

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
								<>
									{!selectedModel.isFree && (
										<FiLock className="h-3 w-3 text-muted-foreground" />
									)}
									<span className="truncate">
										{selectedModel.name}
									</span>
								</>
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

							{models.map((model) => (
								<SelectItem
									key={model.id}
									value={model.id}
									className="text-sm cursor-pointer"
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
							))}

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