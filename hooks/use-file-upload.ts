import { useState, useCallback } from "react";
import { FilePreviewItem } from "@/lib/types/file";
import { FaRegFileCode } from "react-icons/fa";

export const useFileUpload = () => {
	const [attachedFiles, setAttachedFiles] = useState<FilePreviewItem[]>([]);

	// Handle file selection from upload button
	const handleFilesSelected = useCallback((files: File[]) => {
		const newFiles: FilePreviewItem[] = files.map((file) => ({
			id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			file,
			status: "pending",
			name: file.name,
			size: file.size,
			type: file.type,
			icon: FaRegFileCode,
		}));

		setAttachedFiles((prev) => [...prev, ...newFiles]);
	}, []);

	// Remove file from preview
	const handleRemoveFile = useCallback((fileId: string) => {
		setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
	}, []);

	// Clear all files
	const clearFiles = useCallback(() => {
		setAttachedFiles([]);
	}, []);

	// Log attached files info (for debugging)
	const logAttachedFiles = useCallback(() => {
		if (attachedFiles.length > 0) {
			console.log("=== Attached Files ===");
			attachedFiles.forEach((fileItem, index) => {
				const { file } = fileItem;
				console.log(`File ${index + 1}:`, {
					id: fileItem.id,
					name: file.name,
					size: file.size,
					type: file.type,
					lastModified: new Date(file.lastModified).toISOString(),
					progress: fileItem.progress,
				});
			});
			console.log("======================");
		}
	}, [attachedFiles]);

	return {
		attachedFiles,
		handleFilesSelected,
		handleRemoveFile,
		clearFiles,
		logAttachedFiles,
	};
}; 