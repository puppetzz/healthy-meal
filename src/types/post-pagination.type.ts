import { Post } from '@prisma/client';

export type TPostPagination = {
  data: Post[];
  page: number;
  total: number;
};
