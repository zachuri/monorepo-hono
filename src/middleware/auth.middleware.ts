import { AppContext } from "@/lib/context";
import { readBearerToken } from "@/utils/auth";
import { createSession, validateSessionToken } from "@/utils/sessions";
import type { Context } from "hono";
import { env } from "hono/adapter";
import type { User } from "lucia";
import { verifyRequestOrigin } from "lucia";

export const AuthMiddleware = async (
	c: Context<AppContext>,
	next: () => Promise<void>
) => {
	if (c.req.path.startsWith("/auth")) {
		return next();
	}
	const originHeader = c.req.header("Origin") ?? c.req.header("origin");
	const hostHeader = c.req.header("Host") ?? c.req.header("X-Forwarded-Host");
	if (
		(!originHeader ||
			!hostHeader ||
			!verifyRequestOrigin(originHeader, [hostHeader, env(c).WEB_DOMAIN])) &&
		env(c).WORKER_ENV === "production" &&
		c.req.method !== "GET"
	) {
		return new Response(null, {
			status: 403,
		});
	}

	const authorizationHeader = c.req.header("Authorization");
	const bearerSessionId = readBearerToken(authorizationHeader ?? "");
	const sessionId = bearerSessionId;

	if (!sessionId) {
		return new Response("Unauthorized", { status: 401 });
	}

	console.log("SESSION_ID", sessionId);

	const { session, user } = await validateSessionToken(sessionId, c);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}
	// if (session?.fresh) {
	// 	const sessionCookie = await createSession(user.id, session.id, c);
	// 	const serializedCookie = `sessionId=${
	// 		sessionCookie.id
	// 	}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${sessionCookie.expiresAt.toUTCString()}`;
	// 	c.header("Set-Cookie", serializedCookie);
	// }
	c.set("user", user);
	c.set("session", session);
	await next();
};
