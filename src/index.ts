import { Hono } from "hono";
import { hello, comments } from "./routers";

const app = new Hono();

app.route("/hello", hello);
app.route("/comments", comments);

export default app;
