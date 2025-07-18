"use client";

import { useState } from "react";
import { formatFileSize } from "@/lib/constants/supported-files";
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
		maxLength: number = 25
	): string {
		if (fileName.length <= maxLength) return fileName;

		const extension = fileName.substring(fileName.lastIndexOf("."));
		const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
		const availableLength = maxLength - extension.length - 3;

		if (availableLength <= 0) return fileName;

		return nameWithoutExt.substring(0, availableLength) + "..." + extension;
	}

	const handleRemove = () => {
		if (onRemove) {
			onRemove(file.id);
		}
	};

	return (
		<div
			className={cn(
				"relative group bg-muted/30 border border-border/40 rounded-lg p-3 transition-all duration-200 hover:bg-muted/40 hover:border-border/60",
				file.status === "error" && "border-red-300 bg-red-50/20"
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Remove button - shows on hover */}
			{isHovered && onRemove && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleRemove}
					className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-background border border-border rounded-full shadow-sm hover:bg-red-50 hover:border-red-300 z-10"
				>
					<X className="h-3 w-3" />
					<span className="sr-only">Remove file</span>
				</Button>
			)}

			<div className="flex items-start gap-3">
				{/* File icon */}
				<div className="flex-shrink-0 mt-0.5">
					<div className="w-8 h-8 rounded border border-border/40 bg-background/50 flex items-center justify-center text-lg">
						<file.icon className="h-4 w-4" />
					</div>
				</div>

				{/* File info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<span
							className="text-sm font-medium text-foreground truncate"
							title={file.name}
						>
							{truncateFileName(file.name)}
						</span>

						{/* Status indicator */}
						{file.status === "uploading" && (
							<Spinner size="sm" color="dark" />
						)}
					</div>

					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<span>{formatFileSize(file.size)}</span>
						{file.status === "uploading" &&
							file.progress !== undefined && (
								<span>({Math.round(file.progress)}%)</span>
							)}
					</div>

					{/* Progress bar for uploading files */}
					{file.status === "uploading" &&
						file.progress !== undefined && (
							<div className="w-full bg-muted/30 rounded-full h-1 mt-2">
								<div
									className="bg-primary h-1 rounded-full transition-all duration-300"
									style={{ width: `${file.progress}%` }}
								/>
							</div>
						)}
				</div>
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
		<div className={className}>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
				{files.map((file) => (
					<FilePreviewCard
						key={file.id}
						file={file}
						onRemove={onRemoveFile}
					/>
				))}
			</div>
		</div>
	);
};
