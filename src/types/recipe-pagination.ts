import { Recipe } from '@prisma/client';

export type TRecipePagination = {
  recipes: Recipe[];
  page: number;
  total: number;
};
