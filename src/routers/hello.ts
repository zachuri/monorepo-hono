import { Hono } from "hono";
import { AppContext } from "../utils/context";

export const helloRouter = new Hono<AppContext>()
	.get("/", c => c.json("hello from hono"))
	.post("/", c => c.json("create an author", 201))
	.get("/:id", c => c.json(`get ${c.req.param("id")}`));
