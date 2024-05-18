import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { recipes } from './recipes';
import { nutrition } from './nutrition';

export const recipeNutrition = pgTable(
  'recipe_nutrition',
  {
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id),
    nutritionId: integer('nutrition_id')
      .notNull()
      .references(() => nutrition.id),
  },
  (table) => {
    return { pk: primaryKey({ columns: [table.recipeId, table.nutritionId] }) };
  },
);

export const recipeNutritionRelations = relations(
  recipeNutrition,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeNutrition.recipeId],
      references: [recipes.id],
    }),

    nutrition: one(nutrition, {
      fields: [recipeNutrition.nutritionId],
      references: [nutrition.id],
    }),
  }),
);
