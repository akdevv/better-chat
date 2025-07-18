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
	name: string;
	size: number;
	type: string;
	icon: React.ElementType;
	file: File;
	status: "pending" | "uploading" | "uploaded" | "error";
	progress?: number;
}
