export interface UploadResult {
	success: boolean;
	fileKey?: string;
	fileUrl?: string;
	error?: string;
}

export interface UploadProgress {
	progress: number;
	stage: "uploading" | "processing" | "complete";
}

/**
 * Simulates file upload to UploadThing with realistic progress updates
 * This will be replaced with actual UploadThing integration later
 */
export async function simulateFileUpload(
	file: File,
	onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
	return new Promise((resolve) => {
		let progress = 0;

		// Simulate upload progress
		const uploadInterval = setInterval(
			() => {
				progress += Math.random() * 15 + 5; // Random progress between 5-20%

				if (progress >= 100) {
					progress = 100;
					clearInterval(uploadInterval);

					onProgress?.({
						progress: 100,
						stage: "complete",
					});

					// Simulate successful upload with mock data
					setTimeout(() => {
						resolve({
							success: true,
							fileKey: `mock_${Date.now()}_${file.name}`,
							fileUrl: `https://mock-uploadthing.com/files/${Date.now()}_${
								file.name
							}`,
						});
					}, 500);
				} else {
					onProgress?.({
						progress: Math.min(progress, 95),
						stage: progress < 90 ? "uploading" : "processing",
					});
				}
			},
			100 + Math.random() * 100,
		); // Random interval between 100-200ms

		// Simulate potential upload failure (10% chance)
		if (Math.random() < 0.1) {
			setTimeout(
				() => {
					clearInterval(uploadInterval);
					resolve({
						success: false,
						error: "Upload failed: Network error",
					});
				},
				1000 + Math.random() * 2000,
			);
		}
	});
}

/**
 * Simulates batch file upload
 */
export async function simulateMultipleFileUpload(
	files: File[],
	onFileProgress?: (fileIndex: number, progress: UploadProgress) => void,
	onFileComplete?: (fileIndex: number, result: UploadResult) => void,
): Promise<UploadResult[]> {
	const results: UploadResult[] = [];

	// Upload files sequentially (you could also do parallel uploads)
	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		const result = await simulateFileUpload(file, (progress) => {
			onFileProgress?.(i, progress);
		});

		results.push(result);
		onFileComplete?.(i, result);
	}

	return results;
}
