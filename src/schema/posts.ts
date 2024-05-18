import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { postCategory } from './post-category';
import { PostStatus } from 'src/common/enums/post-status.enum';
import { recipes } from './recipes';
import { mealPlanRecipe } from './meal-plan-recipe';

export const statusEnum = pgEnum('post_status', [
  PostStatus.DRAFT,
  PostStatus.PENDING,
  PostStatus.ACCEPTED,
  PostStatus.REJECTED,
]);

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  authorId: varchar('author_id')
    .notNull()
    .references(() => users.id),
  parentId: integer('parent_id').references(() => posts.id),
  title: varchar('title').notNull(),
  published: boolean('published').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  publishedAt: timestamp('published_at').defaultNow(),
  content: text('content').notNull(),
  status: statusEnum('status'),
  recipeId: integer('recipe_id').references(() => recipes.id),
});

export const postRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),

  parent: one(posts, {
    fields: [posts.parentId],
    references: [posts.id],
  }),

  recipe: one(recipes, {
    fields: [posts.recipeId],
    references: [recipes.id],
  }),

  parentPost: one(posts, {
    fields: [posts.parentId],
    references: [posts.id],
  }),

  post: many(posts),

  postCategory: many(postCategory),

  mealPlanRecipe: many(mealPlanRecipe),
}));
