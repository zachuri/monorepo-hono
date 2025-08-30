import type { Database } from '@acme/api/db';
import type { Auth } from '@acme/api/lib/middlewares/auth/initialize-better-auth';
import type { Env } from '@acme/app/env/api';
import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';
import type { Session, User } from '../db/tables/auth';

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

export type AppOpenAPI = OpenAPIHono<AppContext>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppContext>;
