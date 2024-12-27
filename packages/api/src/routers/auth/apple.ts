import jwt from '@tsndr/cloudflare-worker-jwt';
import { Apple } from 'arctic';
import type { Context } from 'hono';
import { env } from 'hono/adapter';
import { generateIdFromEntropySize } from 'lucia'; // Note: okay to use lucia api

import type { User } from '../../db/schema';
import { oauthAccountTable, userTable } from '../../db/schema';
import { createSession, validateSessionToken } from '../../utils/sessions';
import { AppContext } from '../../utils/context';

const appleClient = (c: Context<AppContext>) => {
  return new Apple(
    env(c).APPLE_WEB_CLIENT_ID,
    env(c).APPLE_TEAM_ID,
    env(c).APPLE_KEY_ID,
    new Uint8Array(Buffer.from(env(c).APPLE_PRIVATE_KEY, 'base64')),
    `${env(c).API_DOMAIN}/auth/apple/callback`,
  );
};

export const getAppleAuthorizationUrl = async ({
  c,
  state,
}: {
  c: Context<AppContext>;
  state: string;
}) => {
  const apple = appleClient(c);
  const url = await apple.createAuthorizationURL(state, ['name', 'email']);
  url.searchParams.set('response_mode', 'form_post');
  return url;
};

export const createAppleSession = async ({
  c,
  idToken: initialIdToken, // temporary name change
  code,
  user,
  sessionToken,
}: {
  c: Context<AppContext>;
  code?: string;
  idToken?: string;
  sessionToken?: string;
  user?: {
    username: string;
  };
}) => {
  let idToken = initialIdToken;

  if (!idToken) {
    const apple = appleClient(c);
    if (!code) {
      return null;
    }
    const tokens = await apple.validateAuthorizationCode(code);
    idToken = tokens.idToken();
  }
  if (!idToken) {
    const apple = appleClient(c);
    if (!code) {
      return null;
    }
    const tokens = await apple.validateAuthorizationCode(code);
    idToken = tokens.idToken();
  }
  const { payload, header } = jwt.decode<
    {
      email: string;
      email_verified: string;
      sub: string;
    },
    { kid: string }
  >(idToken);

  const applePublicKey = await fetch('https://appleid.apple.com/auth/keys');
  const applePublicKeyJson: { keys: (JsonWebKey & { kid: string })[] } =
    await applePublicKey.json();
  const publicKey = applePublicKeyJson.keys.find(
    (key) => key.kid === header?.kid,
  );
  if (!publicKey) {
    return null;
  }
  const isValid = await jwt.verify(idToken, publicKey, { algorithm: 'RS256' });

  if (
    !isValid ||
    !payload ||
    payload.iss !== 'https://appleid.apple.com' ||
    !(
      payload?.aud === env(c).APPLE_CLIENT_ID ||
      payload.aud === env(c).APPLE_WEB_CLIENT_ID
    ) ||
    !payload.exp ||
    payload?.exp < Date.now() / 1000
  ) {
    return null;
  }
  const existingAccount = await c.get('db').query.oauthAccountTable.findFirst({
    where: (account, { eq }) =>
      eq(account.providerUserId, payload.sub.toString()),
  });
  let existingUser: User | null = null;
  if (sessionToken) {
    const sessionUser = await validateSessionToken(sessionToken, c);
    if (sessionUser.user) {
      existingUser = sessionUser.user;
    }
  } else {
    const response = await c.get('db').query.userTable.findFirst({
      where: (u, { eq }) => eq(u.email, payload.email),
    });
    if (response) {
      existingUser = response;
    }
  }
  if (
    existingUser?.emailVerified &&
    payload.email_verified &&
    !existingAccount
  ) {
    await c.get('db').insert(oauthAccountTable).values({
      providerUserId: payload.sub.toString(),
      provider: 'apple',
      userId: existingUser.id,
    });
    const session = await createSession(existingUser.id, idToken, c);
    return session;
  }

  if (existingAccount) {
    const session = await createSession(existingAccount.userId, idToken, c);
    return session;
  }
  const userId = generateIdFromEntropySize(15);
  let username = user?.username ?? generateIdFromEntropySize(10);
  const existingUsername = await c.get('db').query.userTable.findFirst({
    where: (u, { eq }) => eq(u.username, username),
  });
  if (existingUsername) {
    username = `${username}-${generateIdFromEntropySize(5)}`;
  }
  await c
    .get('db')
    .insert(userTable)
    .values({
      id: userId,
      username,
      email: payload.email,
      emailVerified: payload.email_verified ? 1 : 0,
      profilePictureUrl: null,
    });

  await c.get('db').insert(oauthAccountTable).values({
    providerUserId: payload.sub,
    provider: 'apple',
    userId,
  });

  const session = await createSession(userId, idToken, c);
  return session;
};
