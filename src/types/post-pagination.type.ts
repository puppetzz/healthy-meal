import { Post } from '@prisma/client';
export type PostPagination = {
  data: Post[];
  page: number;
  total: number;
};
