import { integer, pgTable } from 'drizzle-orm/pg-core';
import { mealPlans } from './meal-plans';
import { relations } from 'drizzle-orm';
import { posts } from './posts';

export const mealPlanRecipe = pgTable('meal_plan_recipe', {
  mealPlanId: integer('meal_plan_id')
    .notNull()
    .references(() => mealPlans.id),
  postId: integer('post_id')
    .notNull()
    .references(() => posts.id),
  day: integer('day').notNull(),
  meal: integer('meal').notNull(),
});

export const mealPlanRecipeRelations = relations(mealPlanRecipe, ({ one }) => ({
  mealPlan: one(mealPlans, {
    fields: [mealPlanRecipe.mealPlanId],
    references: [mealPlans.id],
  }),

  post: one(posts, {
    fields: [mealPlanRecipe.postId],
    references: [posts.id],
  }),
}));
