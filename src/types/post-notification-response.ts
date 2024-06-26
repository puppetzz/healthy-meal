import {
  NotificationExternalTable,
  PostNotification,
  User,
} from '@prisma/client';

export type PostNotificationResponse = PostNotification & {
  isSolved: boolean;
  detail: PostNotificationDetail;
};

export type PostNotificationDetail = {
  externalId: number;
  externalTable: NotificationExternalTable;
  author: User;
};
