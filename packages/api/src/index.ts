import { initializeDB } from '@repo/api/db';
import type { AppContext } from '@repo/api/utils/context';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createAuth } from './lib/auth'; // Ensure this import is correct

const app = new Hono<AppContext>();

// Middleware to initialize auth
app.use('*', (c, next) => {
  const db = initializeDB(c);
  c.set('db', db); // Set db in context after initializedDB
  const auth = createAuth(c); // Initialize auth
  c.set('auth', auth); // Set auth in context
  return next();
});

// CORS configuration
app.use(
  '/api/auth/**',
  cors({
    origin: 'http://localhost:3000', // Replace with your frontend domain
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true, // Required for cookies to work cross-origin
  }),
);

// Middleware to attach user session data
app.use('*', async (c, next) => {
  const auth = c.get('auth'); // Retrieve auth from context
  if (!auth) {
    console.error('Auth is not initialized');
    return next();
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    return next();
  }

  const user = {
    ...session.user,
    image: session.user.image ?? null,
  };

  const sessionData = {
    ...session.session,
    ipAddress: session.session.ipAddress ?? null,
    userAgent: session.session.userAgent ?? null,
  };

  c.set('user', user);
  c.set('session', sessionData);
  return next();
});

// Auth route
app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  const auth = c.get('auth');
  return auth.handler(c.req.raw);
});

// Test route to check session
app.get('/session', async (c) => {
  const session = c.get('session');
  const user = c.get('user');

  if (!user) return c.body(null, 401);

  return c.json({
    session,
    user,
  });
});

export default app;
