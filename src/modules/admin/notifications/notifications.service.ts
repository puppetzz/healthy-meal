import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/database/prisma.service';
import { TResponse } from '../../../types/response-type';
import {
  PostNotificationDetail,
  PostNotificationResponse,
} from '../../../types/post-notification-response';
import { NotificationExternalTable } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getAllNotification(): Promise<
    TResponse<PostNotificationResponse[]>
  > {
    const notifications = await this.prismaService.postNotification.findMany({
      include: {
        notificationOnPost: true,
      },
      orderBy: {
        createAt: 'desc',
      },
    });

    const mealPlanIds = notifications
      .filter(
        (notification) =>
          notification.notificationOnPost[0].externalTable ===
          NotificationExternalTable.MEAL_PLAN,
      )
      .map((notification) => notification.notificationOnPost[0].externalId);

    const postIds = notifications
      .filter(
        (notification) =>
          notification.notificationOnPost[0].externalTable ===
          NotificationExternalTable.POST,
      )
      .map((notification) => notification.notificationOnPost[0].externalId);

    const [mealPlans, posts] = await Promise.all([
      this.prismaService.mealPlan.findMany({
        where: {
          id: {
            in: mealPlanIds,
          },
        },
        include: {
          author: true,
        },
      }),
      this.prismaService.post.findMany({
        where: {
          id: {
            in: postIds,
          },
        },
        include: {
          author: true,
        },
      }),
    ]);

    const details: PostNotificationDetail[] = [
      ...mealPlans.map((mealPlan) => ({
        externalId: mealPlan.id,
        externalTable: NotificationExternalTable.MEAL_PLAN,
        author: mealPlan.author,
      })),
      ...posts.map((post) => ({
        externalId: post.id,
        externalTable: NotificationExternalTable.POST,
        author: post.author,
      })),
    ];

    const response: PostNotificationResponse[] = notifications.map(
      (notification) => {
        const isSolved = !!notification.notificationOnPost[0].reviewerId;

        const detail = details.find(
          (detail) =>
            notification.notificationOnPost[0].externalId === detail.externalId,
        );

        return {
          ...notification,
          isSolved,
          detail,
        };
      },
    );

    return {
      data: response,
      message: 'Get notifications successfully!',
      status: HttpStatus.OK,
    };
  }
}
