import type { Session } from '@api/db/schemas';
import { betterFetch } from '@better-fetch/fetch';
import { env } from '@app/env/next';
import { type NextRequest, NextResponse } from 'next/server';

const authRoutes = ['/sign-in', '/sign-up'];
const passwordRoutes = ['/reset-password-success', '/forgot-password'];

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isPaswordRoute = passwordRoutes.includes(pathName);

  // Fetch the session data from the backend
  const { data: session } = await betterFetch<Session>(
    `${env.API_URL}/api/auth/get-session`,
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    },
  );

  if (!session) {
    if (isAuthRoute || isPaswordRoute) {
      return NextResponse.next();
    }

    // Determine the cookie name based on the environment
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-better-auth.session_token'
        : 'better-auth';

    // Clear the appropriate cookie
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.headers.set(
      'Set-Cookie',
      `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None`,
    );
    return response;
  }

  return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  return await authMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    // '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    '/',
  ],
};
