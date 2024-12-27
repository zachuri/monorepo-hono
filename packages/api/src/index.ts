import httpStatus from 'http-status';
import { Hono } from 'hono';

import { ApiError } from './utils/ApiError';

import { initializeDB } from './db/index.js';
import { AuthMiddleware } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/error.js';
import { authRouter, helloRouter, userRouter } from './routers/index';
import type { AppContext } from './utils/context.js';
import { sentry } from '@hono/sentry';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { env } from 'hono/adapter';

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
