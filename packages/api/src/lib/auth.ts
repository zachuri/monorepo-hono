import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { AppContext } from '@repo/api/utils/context.js';
import { Context } from 'hono';
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const createBetterAuthConfig = (dbInstance: any) => ({
  database: drizzleAdapter(dbInstance, {
    provider: 'pg', // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
});

export const createAuth = (c: Context<AppContext>) => {
  const db = c.get('db');
  const auth = betterAuth(createBetterAuthConfig(db));
  c.set('auth', auth);
  return auth;
};

export type Auth = ReturnType<typeof betterAuth>;
