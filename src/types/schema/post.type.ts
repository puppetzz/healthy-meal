import { posts } from '../../schema';

export type SelectPost = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export type Post = SelectPost | InsertPost;
