import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { recipeFoodCategory } from './recipe-food-category';
import { posts } from './posts';
import { nutrition } from './nutrition';
import { ingredients } from './ingredients';

export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  prepTime: integer('prep_time').notNull(),
  cookTime: integer('cook_time').notNull(),
  servings: integer('servings').notNull(),
  calculationUnit: varchar('calculation_unit').notNull(),
  freezer: varchar('freezer').notNull(),
  keeping: varchar('keeping').notNull(),
});

export const recipeRelations = relations(recipes, ({ one, many }) => ({
  recipeFoodCategory: many(recipeFoodCategory),
  ingredients: many(ingredients),
  nutrition: many(nutrition),

  post: one(posts),
}));
