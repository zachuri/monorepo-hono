import { initializeDrizzleNeonDB } from '@repo/api/db';
import type { AppContext } from '@repo/api/utils/context';
import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';
import { initializeBetterAuth } from './lib/auth'; // Ensure this import is correct
import {
  betterAuthCorsMiddleware,
  handleSessionMiddleware,
} from './middleware/auth.middleware';
import { authRouter, userRouter } from './routers';

export type AppType = typeof app;

const app = new Hono<AppContext>()
  .basePath('/api')
  .use('*', logger())
  .use('*', prettyJSON())
  .use('*', secureHeaders())
  .use('*', timing())
  // Middleware to initialize auth
  .use('*', (c, next) => {
    initializeDrizzleNeonDB(c);
    initializeBetterAuth(c);
    return next();
  })
  .use('/auth/**', (c, next) => betterAuthCorsMiddleware(c)(c, next)) // Use CORS middleware for auth routes
  .use('*', handleSessionMiddleware) // Use session middleware globally
  .route('/auth', authRouter)
  .route('/user', userRouter);

showRoutes(app);

export default app;
