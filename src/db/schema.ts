import { relations, InferSelectModel } from "drizzle-orm";
import { serial, text, timestamp, integer, pgTable } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;

export const postsTable = pgTable("post", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	content: text("content").notNull(),
	userId: integer("user_id")
		.notNull()
		.references(() => userTable.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const commentsTable = pgTable("comments", {
	id: serial("id").primaryKey(),
	postId: integer("post_id").references(() => postsTable.id),
	userId: integer("user_id").references(() => userTable.id),
	text: text("text").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const postsRelations = relations(postsTable, ({ one, many }) => ({
	user: one(userTable, {
		fields: [postsTable.userId],
		references: [userTable.id],
	}),
	comments: many(commentsTable),
}));

export const usersRelations = relations(userTable, ({ many }) => ({
	posts: many(postsTable),
}));

export const commentsRelations = relations(commentsTable, ({ one }) => ({
	post: one(postsTable, {
		fields: [commentsTable.postId],
		references: [postsTable.id],
	}),
	user: one(userTable, {
		fields: [commentsTable.userId],
		references: [userTable.id],
	}),
}));
