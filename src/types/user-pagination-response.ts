import { User } from '@prisma/client';

export type TUsersPaginationResponse = {
  users: User[];
  page: number;
  total: number;
};
