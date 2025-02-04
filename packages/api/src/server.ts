import { showRoutes } from "hono/dev";
import app from "./app";

const port = 8787;
console.log(`Server is running on port - ${port}`);

Bun.serve({
	fetch: app.fetch,
	port,
});

showRoutes(app);
