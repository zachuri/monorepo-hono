import { AppContext } from "@/lib/context";
import { Hono } from "hono";

export const userRouter = new Hono<AppContext>()
	.get("/", c => {
		const user = c.get("user");
		return c.json(user);
	})
	.get("/oauth-accounts", async c => {
		const oauthAccounts = await c.get("db").query.oauthAccountTable.findMany({
			where: (u, { eq }) => eq(u.userId, c.get("user")?.id ?? ""),
		});
		return c.json({
			accounts: oauthAccounts.map(oa => ({
				provider: oa.provider,
			})),
		});
	});
