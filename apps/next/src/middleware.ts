import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
	console.log("HITTTETEEET");

	// const sessionToken = await req.cookies.get("session_token");

	// if (!sessionToken) {
	// 	return NextResponse.redirect(new URL("/", req.url));
	// }

	return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: [
		"/auth/sign-in",
		// "/auth/signup",
		// "/admin/:path*",
		// "/host/:path*",
		// "/auth/onboarding",
	],
};
