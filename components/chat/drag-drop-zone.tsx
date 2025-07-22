"use client";

import { useState, useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import { validateFile } from "@/lib/constants/supported-files";
import { toast } from "sonner";

interface DragDropZoneProps {
	onFilesDropped: (files: File[]) => void;
	children: React.ReactNode;
	disabled?: boolean;
	maxFiles?: number;
}

export const DragDropZone = ({
	onFilesDropped,
	children,
	disabled = false,
	maxFiles = 10,
}: DragDropZoneProps) => {
	const [, setIsDragActive] = useState(false);
	const [isDragOver, setIsDragOver] = useState(false);
	const dragCounterRef = useRef(0);

	const handleDragEnter = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (disabled) return;

			dragCounterRef.current++;

			if (e.dataTransfer.types.includes("Files")) {
				setIsDragActive(true);
			}
		},
		[disabled],
	);

	const handleDragLeave = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (disabled) return;

			dragCounterRef.current--;

			if (dragCounterRef.current === 0) {
				setIsDragActive(false);
				setIsDragOver(false);
			}
		},
		[disabled],
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (disabled) return;

			setIsDragOver(true);

			// Set drop effect
			e.dataTransfer.dropEffect = "copy";
		},
		[disabled],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (disabled) return;

			// Reset drag state
			setIsDragActive(false);
			setIsDragOver(false);
			dragCounterRef.current = 0;

			// Get dropped files
			const droppedFiles = Array.from(e.dataTransfer.files);

			if (droppedFiles.length === 0) return;

			// Validate files
			const validFiles: File[] = [];
			const errors: string[] = [];

			droppedFiles.forEach((file) => {
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
						`Only ${maxFiles} files allowed. Some files were ignored.`,
					);
				}
				onFilesDropped(filesToAdd);
			}
		},
		[disabled, maxFiles, onFilesDropped],
	);

	return (
		<div
			className="relative w-full max-w-3xl mx-auto"
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			{children}

			{/* Simple drag overlay */}
			{isDragOver && !disabled && (
				<div className="absolute inset-0 bg-muted border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center z-50">
					<div className="text-center">
						<Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
						<p className="text-sm text-muted-foreground">
							Drop files here to add to chat
						</p>
					</div>
				</div>
			)}
		</div>
	);
};
