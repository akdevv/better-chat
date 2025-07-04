// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	const { pathname } = req.nextUrl;

	// skip middleware for API routes, static files, etc.
	if (
		pathname.startsWith("/_next") ||
		pathname.includes("/api") ||
		pathname.includes("/static") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	// define public routes that don't require authentication
	const publicRoutes = ["/", "/auth/login", "/auth/register"];

	const isPublicRoute = publicRoutes.includes(pathname);

	// if user is not authenticated
	if (!token) {
		// allow access to public routes only
		if (isPublicRoute) {
			return NextResponse.next();
		}

		// redirect to login page for all other routes
		return NextResponse.redirect(new URL("/auth/login", req.url));
	}

	// user is authenticated
	if (token) {
		// redirect away from auth routes to chat
		if (pathname.startsWith("/auth/")) {
			return NextResponse.redirect(new URL("/chat", req.url));
		}

		// redirect from home page to chat for authenticated users
		if (pathname === "/") {
			return NextResponse.redirect(new URL("/chat", req.url));
		}

		// allow access to all other routes
		return NextResponse.next();
	}
}

// This ensures middleware config only applies to appropriate routes
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
