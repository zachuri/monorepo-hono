import { sentry } from "@hono/sentry";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { env, type AppContext } from "./config/env";
import errorHandler from "./middlewares/error.middleware";
import swaggerApp from "./middlewares/swagger.middleware";
import authRoutes from "./routes/auth.routes";
import iamRoutes from "./routes/iam.routes";
import userRoutes from "./routes/user.routes";

const app = new Hono<AppContext>()
	.basePath("/api")
	// Middlewares
	.use("*", logger())
	.use("*", cors())
	.use("*", csrf())
	.use("*", prettyJSON())
	.use("*", secureHeaders())
	.use("*", timing())
	.use("*", sentry({ dsn: env.SENTRY_DSN, tracesSampleRate: 0.2 }))
	.onError(errorHandler)
	.route("/ui", swaggerApp)
	.route("/auth", authRoutes)
	.route("/iam", iamRoutes)
	.route("/user", userRoutes);

// Export the app TYPE
export type AppType = typeof app;

export default app;
