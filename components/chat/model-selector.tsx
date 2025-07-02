"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const MODELS_LABELS = [
	{
		label: "DeepSeek R1",
		value: "deepseek-r1",
	},
	{
		label: "DeepSeek V3",
		value: "deepseek-v3",
	},
	{
		label: "Gemini 2.0 Flash",
		value: "gemini-2.0-flash",
	},
];

interface ModelSelectorProps {
	value?: string;
	onValueChange?: (value: string) => void;
}

export default function ModelSelector({
	value,
	onValueChange,
}: ModelSelectorProps) {
	return (
		<Select
			value={value || MODELS_LABELS[0].value}
			onValueChange={onValueChange}
		>
			<SelectTrigger className="w-[100px] sm:w-[120px] md:w-[140px] h-7 sm:h-8 border-border/50 hover:bg-card/70 transition-colors text-xs sm:text-sm focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0">
				<SelectValue placeholder="Model" />
			</SelectTrigger>
			<SelectContent>
				{MODELS_LABELS.map((model) => (
					<SelectItem
						key={model.value}
						value={model.value}
						className="text-xs sm:text-sm"
					>
						{model.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
