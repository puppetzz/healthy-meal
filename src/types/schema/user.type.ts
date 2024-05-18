import { users } from 'src/schema';

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type User = SelectUser | InsertUser;
