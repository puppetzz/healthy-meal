import { MealPlan } from '@prisma/client';

export type TMealPlanPagination = {
  data: MealPlan[];
  page: number;
  total: number;
};
