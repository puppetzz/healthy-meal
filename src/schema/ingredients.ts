import { integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { recipes } from './recipes';

export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  name: varchar('name').notNull(),
  description: text('description').notNull(),
  amount: varchar('amount').notNull(),
  unit: varchar('unit').notNull(),
});

export const ingredientRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [ingredients.recipeId],
    references: [recipes.id],
  }),
}));
