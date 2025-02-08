import { initializeDrizzleNeonDB } from '@repo/api/db';
import { helloRouter } from '@repo/api/routers';
import type { AppContext } from '@repo/api/utils/context';
import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';
import { initializeBetterAuth } from './lib/auth'; // Ensure this import is correct
import {
  betterAuthCorsMiddleware,
  handleSessionMiddleware,
  requireAuth,
} from './middleware/auth.middleware';
import { authRouter, userRouter } from './routers';

export type AppType = typeof app;

const app = new Hono<AppContext>()
  .basePath('/api')
  // .use('*', logger())
  // .use('*', prettyJSON())
  // .use('*', secureHeaders())
  // .use('*', timing())
  // Middleware to initialize auth
  .use('*', (c, next) => {
    initializeDrizzleNeonDB(c);
    initializeBetterAuth(c);
    return next();
  })
  // Use CORS middleware for auth routes
  // /auth/**  auth routes or * for all routes to have cors*/
  .use('*', (c, next) => betterAuthCorsMiddleware(c)(c, next))
  .use('*', handleSessionMiddleware) // Use session middleware globally
  .use('/api', requireAuth) // routes are protected
  .route('/auth', authRouter)
  .route('/user', userRouter)
  .route('/hello', helloRouter);

showRoutes(app);

export default app;
