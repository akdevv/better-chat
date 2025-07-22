import { useState, useCallback } from "react";
import { FilePreviewItem } from "@/lib/types/file";
import {
	getFileTypeInfo,
	validateFile,
	FILE_LIMITS,
	formatFileSize,
} from "@/lib/constants/supported-files";

import { FaRegFileCode } from "react-icons/fa";
import { toast } from "sonner";

export const useFileUpload = () => {
	const [attachedFiles, setAttachedFiles] = useState<FilePreviewItem[]>([]);
	const [isUploading, setIsUploading] = useState(false);

	// Check if file already exists (same name and size)
	const isFileAlreadyAttached = useCallback(
		(newFile: File, existingFiles: FilePreviewItem[]) => {
			return existingFiles.some(
				(existing) =>
					existing.name === newFile.name &&
					existing.size === newFile.size
			);
		},
		[]
	);

	// Calculate total size of all attached files
	const getTotalSize = useCallback((files: FilePreviewItem[]) => {
		return files.reduce((total, file) => total + file.size, 0);
	}, []);

	// Add files with validation (only preview)
	const handleFilesSelected = useCallback(
		async (files: File[]) => {
			const validFiles: File[] = [];
			const errors: string[] = [];

			files.forEach((file) => {
				// Check file size (32MB limit)
				if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
					errors.push(`${file.name}: File too large (max 32MB)`);
					return;
				}

				// Check if file type is supported
				const validation = validateFile(file);
				if (!validation.valid) {
					errors.push(`${file.name}: ${validation.error}`);
					return;
				}

				// Check for duplicates
				if (isFileAlreadyAttached(file, attachedFiles)) {
					errors.push(
						`${file.name}: File already attached to this message`
					);
					return;
				}

				validFiles.push(file);
			});

			// Check total count limit (10 files max)
			const totalFilesAfterAdd = attachedFiles.length + validFiles.length;
			if (totalFilesAfterAdd > FILE_LIMITS.MAX_FILE_COUNT) {
				errors.push(
					`Too many files. Maximum ${FILE_LIMITS.MAX_FILE_COUNT} files per message`
				);
				return;
			}

			// Check total size limit (64MB max)
			const currentTotalSize = getTotalSize(attachedFiles);
			const newFilesSize = validFiles.reduce(
				(sum, file) => sum + file.size,
				0
			);
			const totalSizeAfterAdd = currentTotalSize + newFilesSize;

			if (totalSizeAfterAdd > FILE_LIMITS.MAX_TOTAL_SIZE) {
				const remainingSize =
					FILE_LIMITS.MAX_TOTAL_SIZE - currentTotalSize;
				errors.push(
					`Total size limit exceeded. You can add ${formatFileSize(
						remainingSize
					)} more (max 64MB per message)`
				);
				return;
			}

			// Show errors if any
			if (errors.length > 0) {
				console.error("File validation errors:", errors);
				errors.forEach((error) => toast.error(error));
				return;
			}

			// Create preview items for valid files
			const newFiles: FilePreviewItem[] = validFiles.map((file) => {
				const fileTypeInfo = getFileTypeInfo(file.name, file.type);

				return {
					id: `${Date.now()}_${Math.random()
						.toString(36)
						.substr(2, 9)}`,
					file,
					status: "pending",
					name: file.name,
					size: file.size,
					type: file.type,
					icon: fileTypeInfo?.icon || FaRegFileCode,
					uploadData: undefined, // Will be set after upload
				};
			});

			setAttachedFiles((prev) => [...prev, ...newFiles]);

			// Start uploading files immediately
			if (newFiles.length > 0) {
				toast.success(
					`${newFiles.length} file${
						newFiles.length > 1 ? "s" : ""
					} added. Uploading...`
				);
				await uploadFiles(newFiles);
			}
		},
		[attachedFiles, isFileAlreadyAttached, getTotalSize]
	);

	const uploadFiles = useCallback(async (files: FilePreviewItem[]) => {
		setIsUploading(true);

		try {
			// Update files to uploading status
			const fileIds = files.map((f) => f.id);
			setAttachedFiles((prev) =>
				prev.map((f) =>
					fileIds.includes(f.id) ? { ...f, status: "uploading" } : f
				)
			);

			// Upload files in parallel
			const uploadPromises = files.map(async (fileItem) => {
				const formData = new FormData();
				formData.append("files", fileItem.file);

				try {
					const res = await fetch("/api/files", {
						method: "POST",
						body: formData,
					});

					if (!res.ok) {
						throw new Error("Failed to upload file");
					}

					const result = await res.json();

					if (result.error || !result.success) {
						throw new Error(result.error || "Upload failed");
					}

					// Return success result
					return {
						fileId: fileItem.id,
						success: true,
						uploadedFileId: result?.processedFiles[0]?.data?.id,
						data: result?.processedFiles[0]?.data,
					};
				} catch (error) {
					return {
						fileId: fileItem.id,
						success: false,
						error:
							error instanceof Error
								? error.message
								: "Upload failed",
					};
				}
			});

			const uploadResults = await Promise.all(uploadPromises);

			// Update file states with results
			uploadResults.forEach((result) => {
				setAttachedFiles((prev) =>
					prev.map((f) =>
						f.id === result.fileId
							? {
									...f,
									status: result.success
										? "uploaded"
										: "error",
									uploadData: result.success
										? {
												id: result.uploadedFileId,
												key: result.data
													?.uploadThingKey,
												url: result.data
													?.uploadThingUrl,
										  }
										: undefined,
									error: result.success
										? undefined
										: result.error,
							  }
							: f
					)
				);
			});

			// Show summary toasts
			const successful = uploadResults.filter((r) => r.success);
			const failed = uploadResults.filter((r) => !r.success);

			if (successful.length > 0) {
				toast.success(
					`${successful.length} file${
						successful.length > 1 ? "s" : ""
					} uploaded successfully`
				);
			}
			if (failed.length > 0) {
				toast.error(
					`${failed.length} file${
						failed.length > 1 ? "s" : ""
					} failed to upload`
				);
			}
		} catch (error) {
			console.error("Error uploading files:", error);

			// Mark files as error
			const fileIds = files.map((f) => f.id);
			setAttachedFiles((prev) =>
				prev.map((f) =>
					fileIds.includes(f.id)
						? {
								...f,
								status: "error",
								error:
									error instanceof Error
										? error.message
										: "Upload failed",
						  }
						: f
				)
			);

			toast.error("Failed to upload files");
		} finally {
			setIsUploading(false);
		}
	}, []);

	const linkFilesToMessage = useCallback(
		async (chatId: string, messageId: string): Promise<boolean> => {
			const uploadedFiles = attachedFiles.filter(
				(f) => f.status === "uploaded" && f.uploadData?.id
			);

			if (uploadedFiles.length === 0) {
				return true; // No files to link
			}

			try {
				const uploadedFileIds = uploadedFiles.map(
					(f) => f.uploadData!.id
				);

				// Link files to message via API
				const linkResponse = await fetch(
					`/api/chats/${chatId}/messages/${messageId}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							uploadedFileIds,
						}),
					}
				);

				if (!linkResponse.ok) {
					const errorData = await linkResponse.json();
					throw new Error(
						errorData.error || "Failed to link files to message"
					);
				}

				toast.success(
					`${uploadedFiles.length} file${
						uploadedFiles.length > 1 ? "s" : ""
					} attached to message`
				);
				return true;
			} catch (error) {
				console.error("Error linking files to message:", error);
				toast.error("Failed to attach files to message");
				return false;
			}
		},
		[attachedFiles]
	);

	// Remove file from preview
	const handleRemoveFile = useCallback((fileId: string) => {
		setAttachedFiles((prev) => {
			const updated = prev.filter((f) => f.id !== fileId);
			const removedFile = prev.find((f) => f.id === fileId);
			if (removedFile) {
				console.log(`Removed file: ${removedFile.name}`);
			}
			return updated;
		});
	}, []);

	// Clear all files
	const clearFiles = useCallback(() => {
		setAttachedFiles([]);
	}, []);

	// Get upload statistics
	const getUploadStats = useCallback(() => {
		const total = attachedFiles.length;
		const totalSize = getTotalSize(attachedFiles);
		const uploaded = attachedFiles.filter(
			(f) => f.status === "uploaded"
		).length;
		const uploading = attachedFiles.filter(
			(f) => f.status === "uploading"
		).length;
		const pending = attachedFiles.filter(
			(f) => f.status === "pending"
		).length;
		const errors = attachedFiles.filter((f) => f.status === "error").length;

		return {
			total,
			totalSize,
			uploaded,
			uploading,
			pending,
			errors,
			remainingSize: FILE_LIMITS.MAX_TOTAL_SIZE - totalSize,
			remainingFiles: FILE_LIMITS.MAX_FILE_COUNT - total,
		};
	}, [attachedFiles, getTotalSize]);

	// Check if ready to send (has files and none are uploading/error)
	const isReadyToSend = useCallback(() => {
		if (attachedFiles.length === 0) return true;

		// All files should be pending (ready to upload) or uploaded
		return attachedFiles.every(
			(f) => f.status === "pending" || f.status === "uploaded"
		);
	}, [attachedFiles]);

	// Log attached files
	const logAttachedFiles = useCallback(() => {
		if (attachedFiles.length > 0) {
			attachedFiles.forEach((fileItem, index) => {
				console.log(`File ${index + 1}:`, {
					id: fileItem.id,
					name: fileItem.name,
					size: fileItem.size,
					type: fileItem.type,
					status: fileItem.status,
					uploadData: fileItem.uploadData,
					error: fileItem.error,
				});
			});
		}
	}, [attachedFiles]);

	// Get successfully uploaded file IDs for message creation
	const getUploadedFileIds = useCallback(() => {
		return attachedFiles
			.filter((f) => f.status === "uploaded" && f.uploadData?.id)
			.map((f) => f.uploadData!.id);
	}, [attachedFiles]);

	return {
		attachedFiles,
		isUploading,
		handleFilesSelected,
		handleRemoveFile,
		clearFiles,
		linkFilesToMessage,
		getUploadStats,
		isReadyToSend,
		logAttachedFiles,
		getUploadedFileIds,
	};
};
