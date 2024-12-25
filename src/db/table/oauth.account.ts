import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { userTable } from './user';

export const oauthAccountTable = pgTable(
  'oauth_account',
  {
    provider: text('provider').notNull(),
    providerUserId: text('provider_user_id').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => userTable.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerUserId] }),
  }),
);
