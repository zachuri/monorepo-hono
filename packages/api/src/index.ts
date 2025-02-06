import { Hono } from 'hono';
import httpStatus from 'http-status';

import { ApiError } from '@repo/api/utils/ApiError';

import { sentry } from '@hono/sentry';
import { initializeDB } from '@repo/api/db';
import { AuthMiddleware } from '@repo/api/middleware/auth.middleware';
import { errorHandler } from '@repo/api/middleware/error';
import { authRouter, helloRouter, userRouter } from '@repo/api/routers';
import type { AppContext } from '@repo/api/utils/context.js';
import { env } from 'hono/adapter';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono<AppContext>();

app
  .use(logger())
  .use('*', sentry())
  .use('*', cors())
  .use((c, next) => {
    const handler = cors({ origin: env(c).WEB_DOMAIN });
    return handler(c, next);
  })
  .notFound(() => {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  })
  .onError(errorHandler)
  .use((c, next) => {
    initializeDB(c);
    return next();
  })
  .use(AuthMiddleware);

const routes = app
  .route('/auth', authRouter)
  .route('/hello', helloRouter)
  .route('/user', userRouter);

export type AppType = typeof routes;
export default app;
