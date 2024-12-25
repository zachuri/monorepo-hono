import { zValidator } from "@hono/zod-validator";
import { generateCodeVerifier, generateState } from "arctic";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { getCookie, setCookie } from "hono/cookie";
// import { verifyRequestOrigin, type Session } from "lucia";
import { z } from "zod";

// import { createAppleSession, getAppleAuthorizationUrl } from "./apple";
import { createGithubSession, getGithubAuthorizationUrl } from "./github";
import { AppContext } from "@/lib/context";
import { invalidateSession, validateSessionToken } from "@/utils/sessions";
import { readBearerToken } from "@/utils/auth";
import { Session } from "@/db/table/session";
// import { createGoogleSession, getGoogleAuthorizationUrl } from "./google";

export const authRouter = new Hono<AppContext>()
	.get(
		"/:provider",
		zValidator(
			"param",
			z.object({ provider: z.enum(["github", "google", "apple"]) })
		),
		zValidator(
			"query",
			z
				.object({
					redirect: z.enum([
						"com.expoluciaauth.app://",
						"http://localhost:8081",
						"https://expo-lucia-auth-example-web.pages.dev",
					]),
					sessionToken: z.string().optional(),
				})
				.default({ redirect: "http://localhost:8081" })
		),
		async c => {
			const provider = c.req.valid("param").provider;
			const redirect = c.req.valid("query").redirect;
			const sessionToken = c.req.valid("query").sessionToken;
			setCookie(c, "redirect", redirect, {
				httpOnly: true,
				maxAge: 60 * 10,
				path: "/",
				secure: env(c).WORKER_ENV === "production",
			});
			if (sessionToken) {
				const session = await validateSessionToken(sessionToken, c);
				if (session.user) {
					// for account linking
					setCookie(c, "sessionToken", sessionToken, {
						httpOnly: true,
						maxAge: 60 * 10, // 10 minutes
						path: "/",
						secure: env(c).WORKER_ENV === "production",
					});
				}
			}
			const state = generateState();
			if (provider === "github") {
				const url = await getGithubAuthorizationUrl({ c, state });

				setCookie(c, "github_oauth_state", state, {
					httpOnly: true,
					maxAge: 60 * 10,
					path: "/",
					secure: env(c).WORKER_ENV === "production",
				});

				return c.redirect(url.toString());
			}
			// else if (provider === "google") {
			// 	const codeVerifier = generateCodeVerifier();
			// 	const url = await getGoogleAuthorizationUrl({ c, state, codeVerifier });
			// 	setCookie(c, "google_oauth_state", state, {
			// 		httpOnly: true,
			// 		maxAge: 60 * 10,
			// 		path: "/",
			// 		secure: env(c).WORKER_ENV === "production",
			// 	});
			// 	setCookie(c, "google_oauth_code_verifier", codeVerifier, {
			// 		httpOnly: true,
			// 		maxAge: 60 * 10,
			// 		path: "/",
			// 		secure: env(c).WORKER_ENV === "production",
			// 	});
			// 	return c.redirect(url.toString());
			// }
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
		}
	)
	.all(
		"/:provider/callback",
		zValidator(
			"param",
			z.object({ provider: z.enum(["github", "google", "apple"]) })
		),
		async c => {
			try {
				const provider = c.req.valid("param").provider;
				let stateCookie = getCookie(c, `${provider}_oauth_state`);
				const codeVerifierCookie = getCookie(
					c,
					`${provider}_oauth_code_verifier`
				);
				const sessionTokenCookie = getCookie(c, "sessionToken");
				let redirect = getCookie(c, "redirect");

				const url = new URL(c.req.url);
				let state = url.searchParams.get("state");
				let code = url.searchParams.get("code");

				const codeVerifierRequired = ["google"].includes(provider);
				if (c.req.method === "POST") {
					const formData = await c.req.formData();
					state = formData.get("state") as string | null;
					stateCookie = state ?? stateCookie;
					code = formData.get("code") as string | null;
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
					return c.json({ error: "Invalid request" }, 400);
				}
				if (provider === "github") {
					console.log("CODE", code);

					const session = (await createGithubSession({
						c,
						idToken: code,
						sessionToken: sessionTokenCookie,
					})) as Session;

					if (!session) {
						return c.json({}, 400);
					}

					console.log("SESSION AFTER", session);

					const redirectUrl = new URL(redirect);

					redirectUrl.searchParams.append("token", session.id);

					console.log("REDIRECT URL", redirectUrl);

					return c.redirect(redirectUrl.toString());
				}
				// Ensure other providers also return a response
				// else if (provider === "google") {
				// 	// Handle Google provider
				// }
				// else if (provider === "apple") {
				// 	// Handle Apple provider
				// }
				return c.json({}, 400); // Default response if no provider matches
			} catch (error) {
				console.error(error);
				if (error instanceof Error) {
					console.error(error.stack);
				}
				return c.json({ error: "Internal Server Error" }, 500);
			}
		}
	)
	.post("/logout", async c => {
		const authorizationHeader = c.req.header("Authorization");
		const bearerSessionId = readBearerToken(authorizationHeader ?? "");
		const sessionId = bearerSessionId;
		if (!sessionId) {
			return c.json({ error: "Not logged in" }, 400);
		}
		await invalidateSession(sessionId, c);
		return c.json(null, 200);
	});
