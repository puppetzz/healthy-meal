import {
  AnyPgColumn,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  parentId: integer('parent_id').references((): AnyPgColumn => comments.id),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id),
  title: varchar('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  content: text('content').notNull(),
});

export const commentRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),

  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),

  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),

  comments: many(comments),
}));
