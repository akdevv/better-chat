import { FileTypeInfo } from "@/lib/types/file";
import {
	FaRegFileImage,
	FaRegFilePdf,
	FaRegFileWord,
	FaRegFileExcel,
	FaRegFileAlt,
	FaRegFileCode,
} from "react-icons/fa";
import { TbFileDatabase } from "react-icons/tb";

export const SUPPORTED_FILE_TYPES: Record<string, FileTypeInfo> = {
	// Images
	images: {
		extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"],
		mimeTypes: [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/bmp",
			"image/svg+xml",
		],
		category: "image",
		icon: FaRegFileImage,
		maxSize: 16 * 1024 * 1024, // 16MB
		description: "Image files",
	},

	// Documents
	pdf: {
		extensions: [".pdf"],
		mimeTypes: ["application/pdf"],
		category: "document",
		icon: FaRegFilePdf,
		maxSize: 32 * 1024 * 1024, // 32MB
		description: "PDF documents",
	},

	word: {
		extensions: [".doc", ".docx"],
		mimeTypes: [
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		],
		category: "document",
		icon: FaRegFileWord,
		maxSize: 32 * 1024 * 1024, // 32MB
		description: "Word documents",
	},

	// Data files
	spreadsheet: {
		extensions: [".csv", ".xlsx", ".xls"],
		mimeTypes: [
			"text/csv",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		],
		category: "data",
		icon: FaRegFileExcel,
		maxSize: 16 * 1024 * 1024, // 16MB
		description: "Spreadsheet files",
	},

	text: {
		extensions: [".txt", ".md", ".rtf"],
		mimeTypes: ["text/plain", "text/markdown", "text/rtf"],
		category: "document",
		icon: FaRegFileAlt,
		maxSize: 8 * 1024 * 1024, // 8MB
		description: "Text files",
	},

	// Code files
	code: {
		extensions: [
			// JavaScript/TypeScript
			".js",
			".jsx",
			".mjs",
			".cjs",
			".ts",
			".tsx",
			".d.ts",
			// Python
			".py",
			".pyw",
			".pyx",
			".pyi",
			// Web technologies
			".html",
			".htm",
			".css",
			".scss",
			".sass",
			".less",
			// Configuration files
			".json",
			".xml",
			".yaml",
			".yml",
			".toml",
			".ini",
			".env",
			// Java
			".java",
			".class",
			".jar",
			// C#
			".cs",
			".csx",
			".csproj",
			// C/C++
			".cpp",
			".c",
			".cc",
			".cxx",
			".h",
			".hpp",
			".hxx",
			// Go
			".go",
			// Rust
			".rs",
			".rlib",
			// PHP
			".php",
			".phtml",
			".php3",
			".php4",
			".php5",
			// Ruby
			".rb",
			".rbw",
			".rake",
			".gemspec",
			// Shell scripts
			".sh",
			".bash",
			".zsh",
			".fish",
			".bat",
			".cmd",
			".ps1",
			// Other popular languages
			".swift",
			".kt",
			".scala",
			".clj",
			".hs",
			".elm",
			".ex",
			".exs",
			".dart",
			".lua",
			".pl",
			".r",
			".m",
			".f90",
			".f95",
			".f03",
			".vb",
			".vbs",
			".asm",
			".s",
			".lisp",
			".scm",
			".ml",
			".fs",
			".pas",
			".pp",
			".dpr",
			".ada",
			".adb",
			".ads",
			".d",
			// Markup and data
			".md",
			".markdown",
			".tex",
			".rst",
			".org",
			// Build files
			".makefile",
			".mk",
			".cmake",
			".gradle",
			".sbt",
			".pom",
			// database
			".sql",
			".sqlite",
			".sqlite3",
			".db",
			".mdb",
			".accdb",
		],
		mimeTypes: [
			"text/javascript",
			"application/javascript",
			"text/typescript",
			"application/typescript",
			"text/x-python",
			"application/x-python-code",
			"text/html",
			"text/css",
			"application/json",
			"application/xml",
			"text/yaml",
			"text/plain",
			"text/x-java-source",
			"application/java-archive",
			"text/x-csharp",
			"text/x-c",
			"text/x-c++src",
			"text/x-go",
			"text/x-rust",
			"text/x-php",
			"application/x-php",
			"text/x-ruby",
			"text/x-shellscript",
			"application/x-bat",
			"text/markdown",
			"application/sql",
			"application/x-sqlite3",
			"application/x-msaccess",
		],
		category: "code",
		icon: FaRegFileCode,
		maxSize: 4 * 1024 * 1024, // 4MB
		description: "Code files",
	},
};

export const FILE_LIMITS = {
	MAX_FILE_SIZE: 32 * 1024 * 1024, // 32MB
	MAX_TOTAL_SIZE: 64 * 1024 * 1024, // 64MB
	MAX_FILE_COUNT: 10, // max 10 per message
};

// Helper functions
export function getAllowedExtensions(): string[] {
	return Object.values(SUPPORTED_FILE_TYPES).flatMap(
		(type) => type.extensions
	);
}

export function getAllowedMimeTypes(): string[] {
	return Object.values(SUPPORTED_FILE_TYPES).flatMap(
		(type) => type.mimeTypes
	);
}

export function getFileTypeInfo(
	fileName: string,
	mimeType?: string
): FileTypeInfo | null {
	const extension = fileName
		.toLowerCase()
		.substring(fileName.lastIndexOf("."));

	// First try to match by extension
	for (const typeInfo of Object.values(SUPPORTED_FILE_TYPES)) {
		if (typeInfo.extensions.includes(extension)) {
			return typeInfo;
		}
	}

	// Then try to match by mime type if provided
	if (mimeType) {
		for (const typeInfo of Object.values(SUPPORTED_FILE_TYPES)) {
			if (typeInfo.mimeTypes.includes(mimeType)) {
				return typeInfo;
			}
		}
	}

	return null;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
	const fileTypeInfo = getFileTypeInfo(file.name, file.type);

	if (!fileTypeInfo) {
		return {
			valid: false,
			error: `File type not supported.`,
		};
	}

	if (file.size > fileTypeInfo.maxSize) {
		const maxSizeMB = Math.round(fileTypeInfo.maxSize / (1024 * 1024));
		return {
			valid: false,
			error: `File too large. Maximum size for ${fileTypeInfo.description}: ${maxSizeMB}MB`,
		};
	}

	return { valid: true };
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";

	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
