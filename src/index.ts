import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { initializeDB } from "./db";
import { AppContext } from "./lib/context";
import { authRouter, helloRouter, userRouter } from "./routers";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { sentry } from "@hono/sentry";
import { ApiError } from "@/utils/ApiError";
import httpStatus from "http-status";
import { errorHandler } from "./middleware/error";
import { env } from "hono/adapter";

const app = new Hono<AppContext>();

app
	.onError(errorHandler)
	.use(logger())
	.notFound(() => {
		throw new ApiError(httpStatus.NOT_FOUND, "Not found");
	})
	// .use("*", sentry())
	// .use("*", cors())
	.use((c, next) => {
		const handler = cors({ origin: env(c).WEB_DOMAIN });
		return handler(c, next);
	})
	.use((c, next) => {
		initializeDB(c);
		return next();
	})
	.use(AuthMiddleware);

const routes = app
	.route("/auth", authRouter)
	.route("/hello", helloRouter)
	.route("/user", userRouter);

export type AppType = typeof routes;
export default app;
