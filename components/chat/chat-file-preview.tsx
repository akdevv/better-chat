"use client";

import { MessageFile } from "@/lib/types/chat";
import { getFileTypeInfo } from "@/lib/constants/supported-files";
import { cn } from "@/lib/utils";
import { FaRegFileAlt } from "react-icons/fa";

interface ChatFilePreviewProps {
	files: MessageFile[];
	className?: string;
}

const FilePreviewCard = ({ file }: { file: MessageFile }) => {
	const truncateFileName = (
		fileName: string,
		maxLength: number = 18,
	): string => {
		if (fileName.length <= maxLength) return fileName;

		const lastDotIndex = fileName.lastIndexOf(".");
		if (lastDotIndex === -1) {
			return fileName.substring(0, maxLength - 3) + "...";
		}

		const extension = fileName.substring(lastDotIndex);
		const nameWithoutExt = fileName.substring(0, lastDotIndex);
		const availableLength = maxLength - extension.length - 3;

		if (availableLength <= 1) {
			return nameWithoutExt.substring(0, 1) + "..." + extension;
		}

		return nameWithoutExt.substring(0, availableLength) + "..." + extension;
	};

	const fileTypeInfo = getFileTypeInfo(file.name);
	const IconComponent = fileTypeInfo?.icon || FaRegFileAlt;

	return (
		<div className="flex items-center gap-1 px-2.5 py-1.5 bg-muted rounded-lg border border-border/30 select-none">
			<div className="flex-shrink-0">
				<div className="w-5 h-5 flex items-center justify-center">
					<IconComponent className="h-3.5 w-3.5 text-muted-foreground/60" />
				</div>
			</div>

			<span
				className="text-xs text-muted-foreground/80 truncate"
				title={file.name}
			>
				{truncateFileName(file.name)}
			</span>
		</div>
	);
};

export const ChatFilePreview = ({ files, className }: ChatFilePreviewProps) => {
	if (!files || files.length === 0) return null;

	const hasOddFiles = files.length % 2 !== 0;
	const evenFiles = hasOddFiles ? files.slice(0, -1) : files;
	const lastFile = hasOddFiles ? files[files.length - 1] : null;

	return (
		<div className={cn("mb-2 max-w-[80%] ml-auto", className)}>
			{/* Even files in grid */}
			{evenFiles.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
					{evenFiles.map((file) => (
						<FilePreviewCard key={file.id} file={file} />
					))}
				</div>
			)}

			{/* Odd file on the right */}
			{lastFile && (
				<div className="flex justify-end">
					<FilePreviewCard key={lastFile.id} file={lastFile} />
				</div>
			)}
		</div>
	);
};
