import { pgTable, text } from "drizzle-orm/pg-core";

export const taskTable = pgTable("tasks", {
	id: text("id").notNull().primaryKey(),
	title: text("title"),
	content: text("content"),
});
