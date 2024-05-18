import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { posts } from './posts';
import { timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 256 }).primaryKey(),
  fullName: varchar('full_name').notNull(),
  email: varchar('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  picture: varchar('picture').notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(posts),
  mealPlan: many(posts),
}));
