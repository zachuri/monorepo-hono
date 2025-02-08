import type { Database } from '@repo/api/db'
import type { Env } from '@repo/app/env/api'
import type { Session, User } from '../db/tables/auth'
import type { Auth } from '../lib/auth'

type Variables = {
  db: Database
  user: User | null
  session: Session | null
  auth: Auth
}

export interface AppContext {
  Bindings: Env
  Variables: Variables
}
