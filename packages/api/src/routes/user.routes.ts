import { supabase } from "@/libs/supabase/client";
import { Hono } from "hono";

const userRoutes = new Hono().get("/", async c => {
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();
	if (error || !user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	return c.json({ user });
});

export default userRoutes;
