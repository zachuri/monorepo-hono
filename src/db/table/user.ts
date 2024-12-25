import type { InferSelectModel } from 'drizzle-orm';
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const ALL_ROLES = ['user', 'admin'] as const;
export const roleEnum = pgEnum('role', ALL_ROLES);

export const userTable = pgTable(
  'user',
  {
    id: text('id').notNull().primaryKey(),
    name: text('name'),
    email: text('email').notNull(),
    emailVerified: integer('email_verified').notNull(),
    profilePictureUrl: text('image'),
    role: roleEnum('role').notNull().default('user'),
    username: varchar('username', { length: 60 }),
    phoneNumber: varchar('phone_number', { length: 20 }),
    createdAt: timestamp('created_at', { mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    phoneNumberIdx: index('phone_number_idx').on(t.phoneNumber),
    emailIdx: index('email_idx').on(t.email),
  }),
);

export type User = InferSelectModel<typeof userTable>;
