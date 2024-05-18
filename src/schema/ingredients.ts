import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { recipeIngredient } from './recipe-ingredient';
import { relations } from 'drizzle-orm';

export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  description: text('description').notNull(),
  amount: varchar('amount').notNull(),
  unit: varchar('unit').notNull(),
});

export const ingredientRelations = relations(ingredients, ({ many }) => ({
  recipeIngredient: many(recipeIngredient),
}));
