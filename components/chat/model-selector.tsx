"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AI_MODELS } from "@/lib/ai/models";

interface ModelSelectorProps {
	value: string;
	onValueChange?: (value: string) => void;
}

export default function ModelSelector({
	value,
	onValueChange,
}: ModelSelectorProps) {
	const selectedModelName =
		AI_MODELS.find((model) => model.id === value)?.name ||
		AI_MODELS[0].name;

	return (
		<Select value={value} onValueChange={onValueChange}>
			<SelectTrigger className="w-[100px] sm:w-[120px] md:w-[140px] h-7 sm:h-8 border-border/50 hover:bg-card/70 transition-colors text-xs sm:text-sm focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0">
				<SelectValue placeholder={selectedModelName} />
			</SelectTrigger>
			<SelectContent>
				{AI_MODELS.map((model) => (
					<SelectItem
						key={model.id}
						value={model.id}
						className="text-xs sm:text-sm"
					>
						{model.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
