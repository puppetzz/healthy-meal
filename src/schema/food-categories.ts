import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { recipeFoodCategory } from './recipe-food-category';

export const foodCategories = pgTable('food_categories', {
  id: serial('id').primaryKey(),
  key: varchar('key').notNull().unique(),
  name: varchar('name').notNull(),
  icon: varchar('icon').notNull(),
  numberOfRecipes: integer('number_of_recipes').default(0),
});

export const foodCategoryRelations = relations(foodCategories, ({ many }) => ({
  recipeFoodCategory: many(recipeFoodCategory),
}));
