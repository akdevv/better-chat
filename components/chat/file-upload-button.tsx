"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { RiAttachmentLine } from "react-icons/ri";
import {
	getAllowedExtensions,
	validateFile,
} from "@/lib/constants/supported-files";
import { toast } from "sonner";

interface FileUploadButtonProps {
	onFilesSelected: (files: File[]) => void;
	disabled?: boolean;
	maxFiles?: number;
}

export const FileUploadButton = ({
	onFilesSelected,
	disabled = false,
	maxFiles = 10,
}: FileUploadButtonProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		if (disabled) return;
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);

		if (files.length === 0) return;

		// validate files
		const validFiles: File[] = [];
		const errors: string[] = [];

		files.forEach((file) => {
			const validation = validateFile(file);
			if (validation.valid) {
				validFiles.push(file);
			} else {
				errors.push(`${file.name}: ${validation.error}`);
			}
		});

		// Show errors if any
		if (errors.length > 0) {
			console.error("File validation errors:", errors);
			toast.error("Invalid file type or size");
		}

		// Only pass valid files
		if (validFiles.length > 0) {
			const filesToAdd = validFiles.slice(0, maxFiles);
			if (filesToAdd.length < validFiles.length) {
				console.warn(
					`Only ${maxFiles} files allowed. Some files were ignored.`
				);
			}
			onFilesSelected(filesToAdd);
		}

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const allowedExtensions = getAllowedExtensions().join(",");

	return (
		<>
			<Button
				type="button"
				size="sm"
				onClick={handleClick}
				disabled={disabled}
				className="h-9 w-9 p-0 bg-muted hover:bg-muted/80  text-muted-foreground transition-colors cursor-pointer"
				title="Attach files"
			>
				<RiAttachmentLine className="h-4 w-4" />
				<span className="sr-only">Attach files</span>
			</Button>

			<input
				ref={fileInputRef}
				type="file"
				accept={allowedExtensions}
				multiple={true}
				onChange={handleFileChange}
				className="hidden"
				disabled={disabled}
			/>
		</>
	);
};
