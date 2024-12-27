ALTER TABLE "postsTable" RENAME TO "post";--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_post_id_postsTable_id_fk";
--> statement-breakpoint
ALTER TABLE "post" DROP CONSTRAINT "postsTable_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;