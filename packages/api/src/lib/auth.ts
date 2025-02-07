import type { AppContext } from '@repo/api/utils/context.js';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { Context } from 'hono';

const createBetterAuthConfig = (dbInstance: any) => ({
  database: drizzleAdapter(dbInstance, {
    provider: 'pg', // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: 'Ov23li7350aQJ11Ok7nK',
      clientSecret: '13ad6e16a275c8abef450660bc4ed0affc81e065',
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
  baseURL: 'http://localhost:8787',
});

export const createAuth = (c: Context<AppContext>) => {
  const db = c.get('db');
  const betterAuthConfig = createBetterAuthConfig(db);
  const auth = betterAuth({
    ...betterAuthConfig,
    advanced: {
      ...betterAuthConfig.advanced,
      defaultCookieAttributes: {
        sameSite: 'None',
        secure: true,
      },
    },
  });
  c.set('auth', auth);
  return auth;
};

export type Auth = ReturnType<typeof betterAuth>;
