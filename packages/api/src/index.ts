import httpStatus from 'http-status';
import { Hono } from 'hono';

import { ApiError } from '@repo/api/utils/ApiError';

import { initializeDB } from '@repo/api/db';
import { AuthMiddleware } from '@repo/api/middleware/auth.middleware';
import { errorHandler } from '@repo/api/middleware/error';
import { authRouter, helloRouter, userRouter } from '@repo/api/routers';
import type { AppContext } from '@repo/api/utils/context.js';
import { sentry } from '@hono/sentry';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { env } from 'hono/adapter';
import { auth, createAuth } from './lib/auth';

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
  .on(
    ['POST', 'GET'],
    '/api/auth/**',
    cors({
      origin: 'http://localhost:3001', // replace with your origin
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      exposeHeaders: ['Content-Length'],
      maxAge: 600,
      credentials: true,
    }),
    (c) => {
      const auth = createAuth(c);
      return auth.handler(c.req.raw);
    },
  )
  .use(AuthMiddleware);

const routes = app
  .route('/auth', authRouter)
  .route('/hello', helloRouter)
  .route('/user', userRouter);

export type AppType = typeof routes;
export default app;
