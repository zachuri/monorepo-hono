import type { Context } from 'hono';
import { env } from 'hono/adapter';
import { verifyRequestOrigin } from 'lucia';

import { readBearerToken } from '@repo/api/utils/auth';
import type { AppContext } from '@repo/api/utils/context';
import { validateSessionToken } from '@repo/api/utils/sessions';

export const AuthMiddleware = async (
  c: Context<AppContext>,
  next: () => Promise<void>,
) => {
  if (c.req.path.startsWith('/auth')) {
    return next();
  }
  const originHeader = c.req.header('Origin') ?? c.req.header('origin');
  const hostHeader = c.req.header('Host') ?? c.req.header('X-Forwarded-Host');

  if (
    (!originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader, env(c).WEB_DOMAIN])) &&
    env(c).WORKER_ENV === 'production' &&
    c.req.method !== 'GET'
  ) {
    return new Response(null, {
      status: 403,
    });
  }

  const authorizationHeader = c.req.header('Authorization');
  const bearerSessionId = readBearerToken(authorizationHeader ?? '');
  const sessionId = bearerSessionId;

  if (!sessionId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { session, user } = await validateSessionToken(sessionId, c);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  // LATER: check out lucia auth and see what session?fresh is
  // - can add another part of fresh in the schema
  // if (session?.fresh) {
  // 	const sessionCookie = await createSession(user.id, session.id, c);
  // 	const serializedCookie = `sessionId=${
  // 		sessionCookie.id
  // 	}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${sessionCookie.expiresAt.toUTCString()}`;
  // 	c.header("Set-Cookie", serializedCookie);
  // }
  c.set('user', user);
  c.set('session', session);
  await next();
};
