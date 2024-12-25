import { Hono } from "hono";
import { AppContext } from "../lib/context";

export const authRouter = new Hono<AppContext>().get("/login", async c => {
	const db = c.get("db");

	try {
		const data = await db.query.postsTable.findMany({
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

export default authRouter;
