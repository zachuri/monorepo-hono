import type { InferSelectModel } from 'drizzle-orm';
import { sql } from "drizzle-orm";
import { boolean, foreignKey, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from 'drizzle-zod';

// Users Table
export const user = pgTable("user", {
  id: uuid().default(sql`uuid_generate_v7()`).primaryKey().notNull(),
  name: text().notNull(),
  email: text().notNull(),
  emailVerified: boolean("email_verified").notNull(),
  image: text(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  isAnonymous: boolean("is_anonymous"),
}, (table) => [
  unique("users_email_unique").on(table.email),
]);

export type User = InferSelectModel<typeof user>;

// JWKS Table
export const jwk = pgTable("jwk", {
  id: uuid().default(sql`uuid_generate_v7()`).primaryKey().notNull(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

// Sessions Table
export const session = pgTable("session", {
  id: uuid().default(sql`uuid_generate_v7()`).primaryKey().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text().notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "sessions_user_id_users_id_fk"
  }).onDelete("cascade"),
  unique("sessions_token_unique").on(table.token),
]);

export type Session = InferSelectModel<typeof session>;

// Accounts Table
export const account = pgTable("account", {
  id: uuid().default(sql`uuid_generate_v7()`).primaryKey().notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text(),
  password: text(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "accounts_user_id_users_id_fk"
  }).onDelete("cascade"),
]);

// Verifications Table
export const verification = pgTable("verification", {
  id: uuid().default(sql`uuid_generate_v7()`).primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Schemas
export const getUserSchema = createSelectSchema(user)
export const getUserSessionSchema = createSelectSchema(session)
export const getUserAccountsSchema = createSelectSchema(account)
