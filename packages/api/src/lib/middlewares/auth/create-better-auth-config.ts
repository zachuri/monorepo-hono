import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import type { Context } from 'hono'
import { env } from 'hono/adapter'
import type { AppContext } from '~/types/app-context'

/**
 * Creates a configuration object for BetterAuth.
 *
 * This function sets up the configuration for BetterAuth, including the base URL,
 * trusted origins, database adapter, authentication methods, and advanced settings.
 *
 * @param dbInstance - The database instance to be used with BetterAuth.
 * @param c - The context object containing environment variables.
 * @returns A configuration object for BetterAuth.
 */
export function createBetterAuthConfig(dbInstance: any, c: Context<AppContext>) {
  return {
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
      discord: {
        clientId: env(c).DISCORD_CLIENT_ID,
        clientSecret: env(c).DISCORD_CLIENT_SECRET,
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
    rateLimit: {
      window: 10, // time window in seconds
      max: 100, // max requests in the window
    },
  }
}

export default createBetterAuthConfig