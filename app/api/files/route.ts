import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/services/auth";
import { uploadFile } from "@/lib/services/file";

// POST /api/files - Upload files to UploadThing and save to database
export async function POST(req: NextRequest) {
	try {
		const { userId } = await authenticateUser();
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const formData = await req.formData();
		const files = formData.getAll("files") as File[];

		if (!files || files.length === 0) {
			return NextResponse.json(
				{ error: "No files provided" },
				{ status: 400 }
			);
		}

		const processedFiles = await uploadFile(files, userId);

		return NextResponse.json({
			success: true,
			processedFiles,
		});
	} catch (error) {
		console.error("Error uploading files:", error);
		return NextResponse.json(
			{ error: "Failed to upload files" },
			{ status: 500 }
		);
	}
}
