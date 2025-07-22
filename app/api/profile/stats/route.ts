import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/services/auth";
import { getProfileStats } from "@/lib/services/profile";

export async function GET(req: NextRequest) {
	try {
		const { userId } = await authenticateUser();

		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const forceRefresh = req.nextUrl.searchParams.get("refresh") === "true";
		const stats = await getProfileStats(userId, forceRefresh);

		return NextResponse.json(stats);
	} catch (error) {
		console.error("Error fetching profile stats:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
