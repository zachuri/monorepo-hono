import type { Context } from "hono";
import { AppContext } from "../lib/context";
import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const initializeDB = (c: Context<AppContext>) => {
	let db = c.get("db");

	if (!db) {
		const client = neon(c.env.DATABASE_URL);
		db = drizzle(client, { schema });
	}

	c.set("db", db);
	return db;
};

export type Database = NeonHttpDatabase<typeof schema>;
