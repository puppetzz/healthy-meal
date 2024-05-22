ALTER TABLE "food_categories" ADD COLUMN "key" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "food_categories" ADD COLUMN "number_of_recipes" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "food_categories" ADD CONSTRAINT "food_categories_key_unique" UNIQUE("key");