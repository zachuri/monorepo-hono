import type { Database } from '@repo/api/db';
import type { Env } from '@repo/api/types/env';
import { Auth } from '../lib/auth';
import { User, Session } from '../db/table/auth';

type Variables = {
  db: Database;
  user: User | null;
  session: Session | null;
  auth: Auth;
};

export interface AppContext {
  Bindings: Env;
  Variables: Variables;
}
