import { db } from "@/lib/prisma";
import { utapi } from "@/lib/uploadthing/utils";
import { UploadThingFileResult } from "@/lib/types/file";
import { getFileTypeInfo, FILE_LIMITS } from "@/lib/constants/supported-files";

export const getFileGroup = (file: File): string => {
	const fileTypeInfo = getFileTypeInfo(file.name, file.type);
	const extension = file.name
		.toLowerCase()
		.substring(file.name.lastIndexOf("."));

	if (fileTypeInfo?.category === "image") {
		return "image";
	}

	if (extension === ".pdf" || file.type === "application/pdf") {
		return "pdf";
	}

	if (
		fileTypeInfo?.category === "document" ||
		[".txt", ".md", ".rtf", ".doc", ".docx"].includes(extension)
	) {
		return "text";
	}

	if (fileTypeInfo?.category === "code") {
		return "code";
	}

	return "code";
};

export const validateFiles = (
	files: File[]
): { valid: boolean; error?: string } => {
	// Check file count
	if (files.length > FILE_LIMITS.MAX_FILE_COUNT) {
		return {
			valid: false,
			error: `Too many files. Maximum: ${FILE_LIMITS.MAX_FILE_COUNT} files per message`,
		};
	}

	// Check total size
	const totalSize = files.reduce((sum, file) => sum + file.size, 0);
	if (totalSize > FILE_LIMITS.MAX_TOTAL_SIZE) {
		return {
			valid: false,
			error: `Total files too large. Maximum: 64MB per message`,
		};
	}

	// Validate each file individually
	for (const file of files) {
		if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
			return {
				valid: false,
				error: `${file.name}: File too large. Maximum size: 32MB`,
			};
		}

		const fileTypeInfo = getFileTypeInfo(file.name, file.type);
		if (!fileTypeInfo) {
			return {
				valid: false,
				error: `${file.name}: File type not supported`,
			};
		}
	}

	return { valid: true };
};

// Upload files to UploadThing and save to database
export const uploadFile = async (files: File[], userId: string) => {
	// validate before uploading
	const validationResult = validateFiles(files);
	if (!validationResult.valid) {
		throw new Error(validationResult.error);
	}

	const results: UploadThingFileResult[] = [];

	const uploadPromises = files.map(async (file, index) => {
		try {
			const uploadResult = await utapi.uploadFiles([file]);
			if (!uploadResult || !uploadResult[0] || !uploadResult[0].data) {
				throw new Error("UploadThing upload failed");
			}

			const { key, ufsUrl, name, size } = uploadResult[0].data;
			console.log("→ UploadThing result:", { key, ufsUrl, name, size });

			// save to database
			console.log("→ Saving to database...");
			const savedFile = await db.uploadedFile.create({
				data: {
					userId,
					originalName: name,
					mimeType: file.type,
					size,
					fileGroup: getFileGroup(file).toUpperCase() as
						| "IMAGE"
						| "PDF"
						| "TEXT"
						| "CODE",
					uploadThingKey: key,
					uploadThingUrl: ufsUrl,
				},
			});
			console.log("→ Saved to database with ID:", savedFile.id);
			console.log("=================================");

			return {
				success: true,
				fileName: name,
				mimeType: file.type,
				size,
				fileGroup: getFileGroup(file) as
					| "image"
					| "pdf"
					| "text"
					| "code",
				data: {
					id: savedFile.id,
					uploadThingKey: key,
					uploadThingUrl: ufsUrl,
					originalName: name,
				},
			} as UploadThingFileResult;
		} catch (error) {
			console.error(`Error uploading ${file.name}:`, error);
			console.log("=================================");

			return {
				success: false,
				fileName: file.name,
				mimeType: file.type,
				size: file.size,
				fileGroup: getFileGroup(file) as
					| "image"
					| "pdf"
					| "text"
					| "code",
				error: error instanceof Error ? error.message : "Upload failed",
			} as UploadThingFileResult;
		}
	});

	const uploadedFiles = await Promise.all(uploadPromises);
	results.push(...uploadedFiles);

	// Log summary
	const successful = results.filter((r) => r.success).length;
	const failed = results.filter((r) => !r.success).length;
	console.log(
		`=== Upload Summary: ${successful} successful, ${failed} failed ===\n`
	);

	return results;
};
