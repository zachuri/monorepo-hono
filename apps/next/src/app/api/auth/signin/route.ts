import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const provider = "github"; // or any other provider you support
	const redirectTo = `${process.env.NEXT_PUBLIC_API_URL}/auth/callback`;

	// Redirect to your Hono API's sign-in endpoint
	return NextResponse.redirect(
		`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in-with-provider?provider=${provider}&redirectTo=${redirectTo}`
	);
}
