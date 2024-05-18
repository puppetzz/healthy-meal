import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { recipeFoodCategory } from './recipe-food-category';
import { recipeIngredient } from './recipe-ingredient';
import { recipeNutrition } from './recipe_nutrition';
import { posts } from './posts';

export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  prepTime: integer('prep_time').notNull(),
  cookTime: integer('cook_time').notNull(),
  servings: integer('servings').notNull(),
  calculationUnit: varchar('calculation_unit').notNull(),
  freezer: varchar('can_freezer').notNull(),
  keeping: varchar('keeping').notNull(),
});

export const recipeRelations = relations(recipes, ({ one, many }) => ({
  recipeFoodCategory: many(recipeFoodCategory),
  recipeIngredient: many(recipeIngredient),
  recipeNutrition: many(recipeNutrition),

  post: one(posts),
}));
