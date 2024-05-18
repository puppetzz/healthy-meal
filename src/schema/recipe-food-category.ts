import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { recipes } from './recipes';
import { foodCategories } from './food-categories';

export const recipeFoodCategory = pgTable(
  'recipe_food_category',
  {
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id),
    foodCategoryId: integer('food_category_id')
      .notNull()
      .references(() => foodCategories.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.recipeId, table.foodCategoryId] }),
    };
  },
);

export const recipeFoodCategoryRelations = relations(
  recipeFoodCategory,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeFoodCategory.recipeId],
      references: [recipes.id],
    }),

    foodCategory: one(foodCategories, {
      fields: [recipeFoodCategory.foodCategoryId],
      references: [foodCategories.id],
    }),
  }),
);
