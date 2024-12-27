import type { Session, User } from '../db/schema';

import type { Database } from '../db';
import type { Env } from '../types/env';

type Variables = {
  db: Database;
  user: User | null;
  session: Session | null;
};

export interface AppContext {
  Bindings: Env;
  Variables: Variables;
}
