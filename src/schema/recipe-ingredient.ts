import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { recipes } from './recipes';
import { ingredients } from './ingredients';
import { relations } from 'drizzle-orm';

export const recipeIngredient = pgTable(
  'recipe_ingredient',
  {
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id),
    ingredientId: integer('ingredient_id')
      .notNull()
      .references(() => ingredients.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.recipeId, table.ingredientId] }),
    };
  },
);

export const recipeIngredientRelations = relations(
  recipeIngredient,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeIngredient.recipeId],
      references: [recipes.id],
    }),

    ingredient: one(ingredients, {
      fields: [recipeIngredient.ingredientId],
      references: [ingredients.id],
    }),
  }),
);
