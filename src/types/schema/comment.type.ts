import { comments } from 'src/schema';

export type SelectComment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

export type Comment = SelectComment | InsertComment;
