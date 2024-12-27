import type { Session, User } from '@repo/api/db/schema';

import type { Database } from '@repo/api/db';
import type { Env } from '@repo/api/types/env';

type Variables = {
  db: Database;
  user: User | null;
  session: Session | null;
};

export interface AppContext {
  Bindings: Env;
  Variables: Variables;
}
