import { Hono } from "hono";
import { db } from "../db";

const app = new Hono().get("/", async c => {
	try {
		const data = await db.query.posts.findMany({
			with: {
				comments: true,
				user: true,
			},
		});
		return c.json({
			data,
		});
	} catch (error) {
		return c.json({ error });
	}
});

export default app;