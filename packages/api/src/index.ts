import httpStatus from 'http-status';
import { Hono } from 'hono';

import { ApiError } from '@repo/api/utils/ApiError';

import { initializeDB } from '@repo/api/db';
import { errorHandler } from '@repo/api/middleware/error';
import { helloRouter, userRouter } from '@repo/api/routers';
import type { AppContext } from '@repo/api/utils/context.js';
import { sentry } from '@hono/sentry';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { env } from 'hono/adapter';
import { createAuth } from './lib/auth';

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
      origin: 'http://localhost:3000', // replace with your origin
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
  .use('*', async (c, next) => {
    const session = await c
      .get('auth')
      .api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set('user', null);
      c.set('session', null);
      return next();
    }

    // TODO: fix to make it work with just accepting session.user and session.session
    c.set('user', {
      ...session.user,
      image: session.user.image ?? null,
    });
    c.set('session', {
      ...session.session,
      ipAddress: session.session.ipAddress ?? null,
      userAgent: session.session.userAgent ?? null,
    });

    return next();
  })
  .get('/session', async (c) => {
    const session = c.get('session');
    const user = c.get('user');

    if (!user) return c.body(null, 401);

    return c.json({
      session,
      user,
    });
  });

const routes = app.route('/hello', helloRouter).route('/user', userRouter);

export type AppType = typeof routes;
export default app;
