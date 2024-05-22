import { foodCategories } from '../../schema';

export type SelectFoodCategories = typeof foodCategories.$inferSelect;
export type InsertFoodCategories = typeof foodCategories.$inferInsert;

export type FoodCategories = SelectFoodCategories | InsertFoodCategories;
