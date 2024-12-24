import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./routers";
import hello from "./routers/hello";

const app = new Hono();

app.route("/hello", hello);

export default app;
