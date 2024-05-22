import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { recipes } from './recipes';

export const nutrition = pgTable('nutrition', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  name: varchar('name').notNull(),
  amount: varchar('amount').notNull(),
  unit: varchar('unit').notNull(),
});

export const nutritionRelations = relations(nutrition, ({ one }) => ({
  recipes: one(recipes, {
    fields: [nutrition.recipeId],
    references: [recipes.id],
  }),
}));
