export interface FileTypeInfo {
	extensions: string[];
	mimeTypes: string[];
	category: "image" | "document" | "code" | "data";
	icon: React.ElementType;
	maxSize: number;
	description: string;
}

export interface FilePreviewItem {
	id: string;
	file: File;
	name: string;
	size: number;
	type: string;
	icon: React.ElementType;
	status: "pending" | "uploading" | "uploaded" | "error";
	progress?: number;
	uploadData?: {
		id: string;
		key: string;
		url: string;
	};
	error?: string;
}

export interface UploadThingFileResult {
	success: boolean;
	fileName: string;
	mimeType: string;
	size: number;
	fileGroup: "image" | "pdf" | "text" | "code";
	data: {
		id: string;
		uploadThingKey: string;
		uploadThingUrl: string;
		originalName: string;
	};
	error?: string;
}

export interface FileData {
	id: string;
	name: string;
	type: string;
	size: number;
	content?: string;
	url?: string;
}

export enum FileCategory {
	IMAGE = "image",
	DOCUMENT = "document",
	CODE = "code",
	DATA = "data",
}