// lib/uploadthing/core.ts
import { auth } from "@/lib/auth";
import { UploadThingError } from "uploadthing/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
	fileUploader: f({
		image: {
			maxFileSize: "32MB",
			maxFileCount: 50,
		},
		text: {
			maxFileSize: "32MB",
			maxFileCount: 50,
		},
		pdf: {
			maxFileSize: "32MB",
			maxFileCount: 50,
		},
		blob: {
			maxFileSize: "32MB",
			maxFileCount: 50,
		},
	})
		.middleware(async () => {
			const session = await auth();

			if (!session?.user?.id) {
				throw new UploadThingError("Unauthorized");
			}

			return { userId: session.user.id };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			return {
				uploadedBy: metadata.userId,
				fileName: file.name,
				fileSize: file.size,
				fileKey: file.key,
				fileUrl: file.ufsUrl,
			};
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
