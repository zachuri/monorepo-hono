import { sentry } from '@hono/sentry';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import httpStatus from 'http-status';

import { ApiError } from '@/utils/ApiError';

import { initializeDB } from './db';
import { AuthMiddleware } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error';
import { authRouter, helloRouter, userRouter } from './routers';
import type { AppContext } from './utils/context';

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
