import { initializeDrizzleNeonDB } from '@repo/api/db'
import { helloRouter } from '@repo/api/routers'
import type { AppContext } from '@repo/api/utils/context'
import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'
import { timing } from 'hono/timing'
import { initializeBetterAuth } from "./lib/auth"; // Ensure this import is correct
import {
	betterAuthCorsMiddleware,
	handleSessionMiddleware,
	requireAuth,
} from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/error";
import { authRouter, userRouter } from "./routers";

export type AppType = typeof app;

const app = new Hono<AppContext>()
	.basePath("/api")
	.use("*", logger())
	.use("*", prettyJSON())
	.use("*", secureHeaders())
	.use("*", timing())
	// Middleware to initialize auth
	.use("*", (c, next) => {
		initializeDrizzleNeonDB(c);
		initializeBetterAuth(c);
		return next();
	})
	// Use CORS middleware for auth routes
	// /auth/**  auth routes or * for all routes to have cors*/
	.use("*", (c, next) => betterAuthCorsMiddleware(c)(c, next))
	.use("*", handleSessionMiddleware) // Use session middleware globally
	.route("/auth", authRouter)
	.use("*", requireAuth) // routes are protected except /auth
	.route("/user", userRouter)
	.route("/hello", helloRouter)
	.onError(errorHandler);

showRoutes(app)

export default app
