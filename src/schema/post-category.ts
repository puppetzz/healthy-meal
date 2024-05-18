import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { categories } from './categories';
import { relations } from 'drizzle-orm';

export const postCategory = pgTable(
  'post_category',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.categoryId] }),
  }),
);

export const postOnCategoryRelations = relations(postCategory, ({ one }) => ({
  post: one(posts, {
    fields: [postCategory.postId],
    references: [posts.id],
  }),

  category: one(categories, {
    fields: [postCategory.categoryId],
    references: [categories.id],
  }),
}));
