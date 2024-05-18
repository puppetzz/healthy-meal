import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { recipeFoodCategory } from './recipe-food-category';

export const foodCategories = pgTable('food_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
});

export const foodCategoryRelations = relations(foodCategories, ({ many }) => ({
  recipeFoodCategory: many(recipeFoodCategory),
}));
