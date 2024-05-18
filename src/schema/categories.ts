import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { postCategory } from './post-category';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  parentId: integer('parent_id').references(() => categories.id),
  title: varchar('title').notNull(),
});

export const categoryRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),

  categories: many(categories),

  postCategory: many(postCategory),
}));
