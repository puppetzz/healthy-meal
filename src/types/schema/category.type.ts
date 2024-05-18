import { categories } from 'src/schema';

export type SelectCategory = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type Category = SelectCategory | InsertCategory;
