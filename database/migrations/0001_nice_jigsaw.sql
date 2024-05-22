DROP TABLE "recipe_ingredient";--> statement-breakpoint
DROP TABLE "recipe_nutrition";--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "published_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "recipe_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "nutrition" ADD COLUMN "recipe_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "freezer" varchar NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nutrition" ADD CONSTRAINT "nutrition_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN IF EXISTS "title";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN IF EXISTS "can_freezer";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");