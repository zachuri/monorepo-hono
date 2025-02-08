import type { AppContext } from '@repo/api/utils/context.js'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import type { Context } from 'hono'
import { env } from 'hono/adapter'

// Load environment variables
const createBetterAuthConfig = (dbInstance: any, c: Context<AppContext>) => ({
  baseURL: env(c).API_DOMAIN, // API URL
  trustedOrigins: [env(c).API_DOMAIN, env(c).WEB_DOMAIN], // Needed for cross domain cookies
  database: drizzleAdapter(dbInstance, {
    provider: 'pg', // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env(c).GITHUB_CLIENT_ID,
      clientSecret: env(c).GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env(c).GOOGLE_CLIENT_ID,
      clientSecret: env(c).GOOGLE_CLIENT_SECRET,
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true, // Enables cross-domain cookies
    },
    defaultCookieAttributes: {
      sameSite: 'none', // Required for cross-domain cookies
      secure: true, // Ensures cookies are only sent over HTTPS
    },
  },
})

export const initializeBetterAuth = (c: Context<AppContext>) => {
  const db = c.get('db')
  const betterAuthConfig = createBetterAuthConfig(db, c)
  const auth = betterAuth({
    ...betterAuthConfig,
    advanced: {
      ...betterAuthConfig.advanced,
      defaultCookieAttributes: {
        sameSite: 'none',
        secure: true,
      },
    },
  })
  c.set('auth', auth)
  return auth
}

export type Auth = ReturnType<typeof betterAuth>
