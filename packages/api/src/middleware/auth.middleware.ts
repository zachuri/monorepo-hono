import type { Context } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import type { AppContext } from '../utils/context'

/**
 * Handle session from auth middleware.
 *
 * This middleware will fetch the session from auth API for every request and
 * store it in the context. If the session is not found, it will set the user and
 * session to null in the context.
 *
 * @param c - The context object
 * @param next - The next function to run
 */
export async function handleSessionMiddleware(c: Context<AppContext>, next: () => Promise<void>) {
  const auth = c.get('auth') // Retrieve auth from context
  if (!auth) {
    console.error('Auth is not initialized')
    return next()
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    c.set('user', null)
    c.set('session', null)
    return next()
  }

  const user = {
    ...session.user,
    image: session.user.image ?? null,
  }

  const sessionData = {
    ...session.session,
    ipAddress: session.session.ipAddress ?? null,
    userAgent: session.session.userAgent ?? null,
  }

  c.set('user', user)
  c.set('session', sessionData)
  return next()
}

/**
 * CORS Middleware for better authentication.
 *
 * This middleware configures Cross-Origin Resource Sharing (CORS) settings
 * for the application. It allows the application to handle requests from
 * specified origins and supports specific HTTP methods and headers.
 *
 * @param origin - The allowed origins for CORS requests
 * @param allowHeaders - The headers allowed in CORS requests
 * @param allowMethods - The HTTP methods allowed in CORS requests
 * @param exposeHeaders - The headers exposed to the client
 * @param maxAge - The maximum age for the CORS preflight request cache
 * @param credentials - Whether credentials are supported in CORS requests
 */
export const betterAuthCorsMiddleware = (c: Context<AppContext>) =>
  cors({
    origin: [env(c).WEB_DOMAIN || 'http://localhost:3000'], // Use env var for frontend domain
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true, // Required for cookies to work cross-origin
  })

export const requireAuth = async (c: Context<AppContext>, next: () => Promise<void>) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
}
