import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { initializeDB } from "./db";
import { AppContext } from "./lib/context";
import { authRoute, helloRouter } from "./routers";

const app = new Hono<AppContext>();

app
	// .use("*", sentry())
	// .use("*", cors())
	// .use("*", logger())
	// .notFound(() => {
	// 	throw new ApiError(httpStatus.NOT_FOUND, "Not found");
	// })
	// .onError(errorHandler)
	.use((c, next) => {
		initializeDB(c);
		// initializeLucia(c);
		return next();
	});
// .use(AuthMiddleware);

const routes = app.route("/auth", authRoute).route("/hello", helloRouter);

export type AppType = typeof routes;
export default app;
