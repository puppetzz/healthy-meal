import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { MealPlanFrequencyUnit } from 'src/common/enums/meal-plan-frequency-unit.enum';
import { MealPlanStatus } from 'src/common/enums/meal-plan-status.enum';
import { users } from './users';
import { mealPlanRecipe } from './meal-plan-recipe';

export const mealPlanStatusEnum = pgEnum('meal_plan_status', [
  MealPlanStatus.DRAFT,
  MealPlanStatus.PUBLISHED,
  MealPlanStatus.ARCHIVED,
]);

export const frequencyUnitEnum = pgEnum('frequency_unit', [
  MealPlanFrequencyUnit.DAY,
  MealPlanFrequencyUnit.WEEK,
  MealPlanFrequencyUnit.MONTH,
  MealPlanFrequencyUnit.YEAR,
]);

export const mealPlans = pgTable('meal_plans', {
  id: serial('id').primaryKey(),
  authorId: varchar('author_id')
    .notNull()
    .references(() => users.id),
  title: varchar('title').notNull(),
  content: varchar('content').notNull(),
  status: mealPlanStatusEnum('status').notNull().default(MealPlanStatus.DRAFT),
  frequencyUnit: frequencyUnitEnum('frequency_unit'),
});

export const mealPlanRelations = relations(mealPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [mealPlans.authorId],
    references: [users.id],
  }),

  mealPlanRecipe: many(mealPlanRecipe),
}));
