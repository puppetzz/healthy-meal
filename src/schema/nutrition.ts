import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { recipeNutrition } from './recipe_nutrition';

export const nutrition = pgTable('nutrition', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  amount: varchar('amount').notNull(),
  unit: varchar('unit').notNull(),
});

export const nutritionRelations = relations(nutrition, ({ many }) => ({
  recipeNutrition: many(recipeNutrition),
}));
