import { zValidator } from '@hono/zod-validator';
import { generateCodeVerifier, generateState } from 'arctic';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';

import type { Session } from '@repo/api/db/schema';
import {
  invalidateSession,
  validateSessionToken,
} from '@repo/api/utils/sessions';

import {
  createGithubSession,
  getGithubAuthorizationUrl,
} from '@repo/api/routers/auth/github';
import {
  createGoogleSession,
  getGoogleAuthorizationUrl,
} from '@repo/api/routers/auth/google';
import { AppContext } from '@repo/api/utils/context';
import { readBearerToken } from '@repo/api/utils/auth';

export const authRouter = new Hono<AppContext>()
  .get(
    '/:provider',
    zValidator(
      'param',
      z.object({ provider: z.enum(['github', 'google', 'apple']) }),
    ),
    zValidator(
      'query',
      z
        .object({
          redirect: z.enum([
            'com.expoluciaauth.app://',
            'http://localhost:3000',
            'http://localhost:8081',
            'https://expo-lucia-auth-example-web.pages.dev',
          ]),
          sessionToken: z.string().optional(),
        })
        .default({ redirect: 'http://localhost:3000' }),
    ),
    async (c) => {
      const { provider } = c.req.valid('param');
      const { redirect } = c.req.valid('query');
      const { sessionToken } = c.req.valid('query');
      setCookie(c, 'redirect', redirect, {
        httpOnly: true,
        maxAge: 60 * 10,
        path: '/',
        secure: env(c).WORKER_ENV === 'production',
      });
      if (sessionToken) {
        const session = await validateSessionToken(sessionToken, c);
        if (session.user) {
          // for account linking
          setCookie(c, 'sessionToken', sessionToken, {
            httpOnly: true,
            maxAge: 60 * 10, // 10 minutes
            path: '/',
            secure: env(c).WORKER_ENV === 'production',
          });
        }
      }
      const state = generateState();
      if (provider === 'github') {
        const url = await getGithubAuthorizationUrl({ c, state });
        setCookie(c, 'github_oauth_state', state, {
          httpOnly: true,
          maxAge: 60 * 10,
          path: '/',
          secure: env(c).WORKER_ENV === 'production',
        });
        return c.redirect(url.toString());
      }
      if (provider === 'google') {
        const codeVerifier = generateCodeVerifier();
        const url = await getGoogleAuthorizationUrl({ c, state, codeVerifier });
        setCookie(c, 'google_oauth_state', state, {
          httpOnly: true,
          maxAge: 60 * 10,
          path: '/',
          secure: env(c).WORKER_ENV === 'production',
        });
        setCookie(c, 'google_oauth_code_verifier', codeVerifier, {
          httpOnly: true,
          maxAge: 60 * 10,
          path: '/',
          secure: env(c).WORKER_ENV === 'production',
        });
        return c.redirect(url.toString());
      }
      // else if (provider === "apple") {
      // 	const url = await getAppleAuthorizationUrl({ c, state });
      // 	setCookie(c, "apple_oauth_state", state, {
      // 		httpOnly: true,
      // 		maxAge: 60 * 10,
      // 		path: "/",
      // 		secure: env(c).WORKER_ENV === "production",
      // 		sameSite: "None",
      // 	});
      // 	return c.redirect(url.toString());
      // }
      return c.json({}, 400);
    },
  )
  .all(
    '/:provider/callback',
    zValidator(
      'param',
      z.object({ provider: z.enum(['github', 'google', 'apple']) }),
    ),
    async (c) => {
      try {
        const { provider } = c.req.valid('param');
        let stateCookie = getCookie(c, `${provider}_oauth_state`);
        const codeVerifierCookie = getCookie(
          c,
          `${provider}_oauth_code_verifier`,
        );
        const sessionTokenCookie = getCookie(c, 'sessionToken');
        let redirect = getCookie(c, 'redirect');

        const url = new URL(c.req.url);
        let state = url.searchParams.get('state');
        let code = url.searchParams.get('code');
        const codeVerifierRequired = ['google'].includes(provider);
        if (c.req.method === 'POST') {
          const formData = await c.req.formData();
          const stateEntry = formData.get('state');
          state = typeof stateEntry === 'string' ? stateEntry : null;
          stateCookie = state ?? stateCookie;
          const codeEntry = formData.get('code');
          code = typeof codeEntry === 'string' ? codeEntry : null;
          redirect = env(c).WEB_DOMAIN;
        }
        if (
          !state ||
          !stateCookie ||
          !code ||
          stateCookie !== state ||
          !redirect ||
          (codeVerifierRequired && !codeVerifierCookie)
        ) {
          return c.json({ error: 'Invalid request' }, 400);
        }
        if (provider === 'github') {
          const session = await createGithubSession({
            c,
            idToken: code,
            sessionToken: sessionTokenCookie,
          });
          if (!session) {
            return c.json({}, 400);
          }
          const redirectUrl = new URL(redirect);
          redirectUrl.searchParams.append('token', session.id);
          return c.redirect(redirectUrl.toString());
        }
        if (provider === 'google') {
          const session = await createGoogleSession({
            c,
            idToken: code,
            codeVerifier: codeVerifierCookie!,
            sessionToken: sessionTokenCookie,
          });
          if (!session) {
            return c.json({}, 400);
          }
          const redirectUrl = new URL(redirect);
          redirectUrl.searchParams.append('token', session.id);
          return c.redirect(redirectUrl.toString());
        }
        // else if (provider === "apple") {
        // 	const originHeader = c.req.header("Origin");
        // 	const hostHeader = c.req.header("Host");
        // 	if (
        // 		!originHeader ||
        // 		!hostHeader ||
        // 		!verifyRequestOrigin(originHeader, [
        // 			hostHeader,
        // 			"appleid.apple.com",
        // 		])
        // 	) {
        // 		return c.json({}, 403);
        // 	}
        // 	const formData = await c.req.formData();
        // 	const userJSON = formData.get("user"); // only available first time
        // 	let user: { username: string } | undefined;
        // 	if (userJSON) {
        // 		const reqUser = JSON.parse(userJSON) as {
        // 			name: { firstName: string; lastName: string };
        // 			email: string;
        // 		};
        // 		user = {
        // 			username: `${reqUser.name.firstName} ${reqUser.name.lastName}`,
        // 		};
        // 	}
        // 	const session = await createAppleSession({
        // 		c,
        // 		code,
        // 		user,
        // 		sessionToken: sessionTokenCookie,
        // 	});
        // 	if (!session) {
        // 		return c.json({}, 400);
        // 	}
        // 	// always web
        // 	const redirectUrl = new URL(redirect);
        // 	redirectUrl.searchParams.append("token", session.id);
        // 	return c.redirect(redirectUrl.toString());
        // }
        return c.json({}, 400);
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          console.error(error.stack);
        }
      }
    },
  )
  .post(
    '/login/:provider',
    zValidator(
      'json',
      z.object({
        idToken: z.string(),
        user: z
          .object({
            username: z.string(),
          })
          .optional(),
        sessionToken: z.string().optional(),
      }),
    ),
    zValidator(
      'param',
      z.object({
        provider: z.enum(['github', 'google', 'apple']),
      }),
    ),
    async (c) => {
      const provider = c.req.param('provider');
      const { idToken } = c.req.valid('json');
      const { sessionToken } = c.req.valid('json');
      let session: Session | null = null;
      if (provider === 'github') {
        session = (await createGithubSession({
          c,
          idToken,
          sessionToken,
        })) as Session;
      } else if (provider === 'google') {
        session = (await createGoogleSession({
          c,
          idToken,
          codeVerifier: '',
          sessionToken,
        })) as Session;
      }
      // else if (provider === "apple") {
      // 	session = await createAppleSession({
      // 		c,
      // 		idToken,
      // 		user: c.req.valid("json").user,
      // 		sessionToken,
      // 	});
      // }
      if (!session) {
        return c.json({}, 400);
      }
      return c.json({ token: session.id });
    },
  )
  .post('/logout', async (c) => {
    const authorizationHeader = c.req.header('Authorization');
    const bearerSessionId = readBearerToken(authorizationHeader ?? '');
    const sessionId = bearerSessionId;
    if (!sessionId) {
      return c.json({ error: 'Not logged in' }, 400);
    }
    await invalidateSession(sessionId, c);
    return c.json(null, 200);
  });
