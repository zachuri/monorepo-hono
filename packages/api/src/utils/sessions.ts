import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { eq } from 'drizzle-orm'
import type { Context } from 'hono'

import type { Session, User } from '@repo/api/db/schemas'
import { sessionTable, userTable } from '@repo/api/db/schemas'
import type { AppContext } from '@repo/api/utils/context'

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

export async function createSession(
  userId: string,
  token: string,
  c: Context<AppContext>
): Promise<Session> {
  const db = c.get('db')
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    token,
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: null,
    userAgent: null,
  }
  await db.insert(sessionTable).values(session)
  return session
}

export async function validateSessionToken(
  token: string,
  c: Context<AppContext>
): Promise<SessionValidationResult> {
  const db = c.get('db')
  const result = await db
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, token))

  if (!result || result.length < 1) {
    return { session: null, user: null }
  }

  const firstResult = result[0]
  if (!firstResult) {
    return { session: null, user: null }
  }

  const { user, session } = firstResult // Now safe to destructure
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id))
    return { session: null, user: null }
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id))
  }
  return { session, user }
}

export async function invalidateSession(sessionId: string, c: Context<AppContext>): Promise<void> {
  const db = c.get('db')

  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId))
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null }
