import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

export async function uploadFileToUploadThing(file: File) {
	try {
		return await utapi.uploadFiles(file);
	} catch (error) {
		console.error("Server upload error:", error);
		throw error;
	}
}
