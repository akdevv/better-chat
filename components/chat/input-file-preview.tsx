"use client";

import { useState } from "react";
import {
	formatFileSize,
	getFileCategory,
} from "@/lib/constants/supported-files";
import { cn } from "@/lib/utils";
import { FilePreviewItem } from "@/lib/types/file";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/spinner";
import { X } from "lucide-react";

interface InputFilePreviewProps {
	files: FilePreviewItem[];
	onRemoveFile?: (id: string) => void;
	className?: string;
}

const FilePreviewCard = ({
	file,
	onRemove,
}: {
	file: FilePreviewItem;
	onRemove?: (id: string) => void;
}) => {
	const [isHovered, setIsHovered] = useState(false);

	function truncateFileName(
		fileName: string,
		maxLength: number = 16
	): string {
		if (fileName.length <= maxLength) return fileName;

		const lastDotIndex = fileName.lastIndexOf(".");
		if (lastDotIndex === -1) {
			return fileName.substring(0, maxLength - 3) + "...";
		}

		const extension = fileName.substring(lastDotIndex);
		const nameWithoutExt = fileName.substring(0, lastDotIndex);
		const availableLength = maxLength - extension.length - 3;

		if (availableLength <= 0) {
			return "..." + extension;
		}

		return nameWithoutExt.substring(0, availableLength) + "..." + extension;
	}

	const getIconColor = (category: string) => {
		switch (category) {
			case "image":
				return "text-blue-500/70";
			case "code":
				return "text-green-500/70";
			case "document":
				return "text-red-500/70";
			case "data":
				return "text-purple-500/70";
			default:
				return "text-slate-500/70";
		}
	};

	const handleRemove = () => {
		if (onRemove) {
			onRemove(file.id);
		}
	};

	const fileCategory = getFileCategory(file.name, file.type);
	const iconColor = getIconColor(fileCategory);

	return (
		<div
			className={cn(
				"relative group p-3 rounded-lg border transition-all duration-200",
				"bg-muted hover:bg-muted/70",
				file.status === "error" && "border-red-200 bg-red-50/30"
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Remove button */}
			{onRemove &&
				(file.status === "error" ||
					(isHovered && file.status !== "uploading")) && (
					<Button
						type="button"
						size="sm"
						onClick={handleRemove}
						className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-muted text-muted-foreground border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer shadow-sm"
					>
						<X className="h-3 w-3" />
						<span className="sr-only">Remove file</span>
					</Button>
				)}

			{/* Loading overlay */}
			{file.status === "uploading" && (
				<div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
					<Spinner size="sm" />
				</div>
			)}

			<div className="flex items-start gap-3">
				{/* File icon */}
				<div className="flex-shrink-0 mt-0.5">
					<div className="w-8 h-8 rounded border border-border/30 bg-background/50 flex items-center justify-center">
						<file.icon className={cn("h-4 w-4", iconColor)} />
					</div>
				</div>
				{file.status === "error" ? (
					<div className="mt-2 text-xs text-red-400">
						Error uploading
					</div>
				) : (
					<div className="flex-1 min-w-0">
						<div className="mb-1">
							<span
								className="text-sm font-medium text-foreground block truncate"
								title={file.name}
							>
								{truncateFileName(file.name)}
							</span>
						</div>
						<div className="text-xs text-muted-foreground">
							{formatFileSize(file.size)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export const InputFilePreview = ({
	files,
	onRemoveFile,
	className,
}: InputFilePreviewProps) => {
	if (files.length === 0) return null;

	return (
		<div
			className={cn(
				"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3",
				className
			)}
		>
			{files.map((file) => (
				<FilePreviewCard
					key={file.id}
					file={file}
					onRemove={onRemoveFile}
				/>
			))}
		</div>
	);
};
