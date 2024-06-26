import { OnModuleInit, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WSAuthUser } from '../../decorators/auth-web-socket.decorator';
import { auth } from 'firebase-admin';
import { ERole } from '../../common/enums/role.enum';
import { ADMIN_ROOM } from '../../common/constants/general';
import { AuthSocketGuard } from '../auth/guards/auth-socket.guard';
import { TPublishRecipe } from '../../types/publish-recipe.type';
import { PrismaService } from '../../services/database/prisma.service';
import {
  MealPlan,
  NotificationExternalTable,
  Post,
  PostStatus,
} from '@prisma/client';

@WebSocketGateway(5001, { cors: true })
export class EventsGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  constructor(private readonly prismaService: PrismaService) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('WS connected:', socket.id);
    });
  }

  async handleConnection(socket: Socket) {
    const token = socket.handshake.headers.authorization;

    await auth()
      .verifyIdToken(token)
      .then((claims) => {
        if (!claims.role || claims.role !== ERole.ADMIN) {
          return;
        }
        socket.join(ADMIN_ROOM);
      })
      .catch(() => {
        socket.disconnect();
      });
  }

  async handleDisconnect() {}

  @SubscribeMessage('test')
  async testMessage() {
    console.log('test');
  }

  @UseGuards(AuthSocketGuard)
  @SubscribeMessage('onPublishRecipe')
  async publishRecipe(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: TPublishRecipe,
    @WSAuthUser('uid') userId: string,
  ) {
    const { recipeId } = data;

    if (!recipeId) {
      this.server.emit('errors', {
        message: 'Recipe Id is required!',
      });
      return;
    }

    const recipe = await this.prismaService.recipe.findFirst({
      where: {
        id: recipeId,
      },
      include: {
        post: true,
      },
    });

    if (!recipe) {
      this.server.emit('error', {
        message: 'Recipe does not exist!',
      });
      return;
    }

    if (
      recipe.post.status !== PostStatus.DRAFT &&
      recipe.post.status !== PostStatus.REJECTED
    ) {
      this.server.emit('error', {
        message: 'Invalid status!',
      });

      return;
    }

    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        role: true,
      },
    });

    if (user.role.name === ERole.ADMIN) {
      await this.prismaService.$transaction(async (tx) => {
        await tx.post.update({
          where: {
            recipeId: recipeId,
            id: recipe.post.id,
          },
          data: {
            status: PostStatus.ACCEPTED,
            reviewerId: userId,
          },
        });
        const noti = await tx.postNotification.create({
          data: {
            title: 'Chia Sẻ Công Thức',
            content: 'Chia Sẻ Công Thức Thành Công!',
          },
        });

        await tx.notificationOnPost.create({
          data: {
            externalId: recipe.post.id,
            externalTable: NotificationExternalTable.POST,
            postNotificationId: noti.id,
          },
        });
      });

      this.server.to(socket.id).emit('onPublishSuccess', {
        message: 'Chia Sẻ Công Thức Thành Công!',
      });

      return;
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.post.update({
        where: {
          recipeId: recipeId,
          id: recipe.post.id,
        },
        data: {
          status: PostStatus.PENDING,
        },
      });
      const noti = await tx.postNotification.create({
        data: {
          title: 'Chia Sẻ Công Thức',
          content: `${user.fullName} yêu cầu chia sẻ công thức ${recipe.post.title}`,
        },
      });

      await tx.notificationOnPost.create({
        data: {
          externalId: recipe.post.id,
          externalTable: NotificationExternalTable.POST,
          postNotificationId: noti.id,
        },
      });
    });

    this.server.to(socket.id).emit('onMessage', {
      message: 'Yêu cầu của bạn đang được đợi phê duyệt bởi admin',
    });
    this.server.to(ADMIN_ROOM).emit('onPublishRecipe', {
      message: 'Yêu cầu chia sẻ công thức mới',
    });
  }

  public async createAndPublishRecipes(userId: string, post: Post) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    const notification = await this.prismaService.postNotification.create({
      data: {
        title: 'Chia Sẻ Công Thức',
        content: `${user.fullName} yêu cầu chia sẻ công thức ${post.title}`,
      },
    });

    await this.prismaService.notificationOnPost.create({
      data: {
        externalId: post.id,
        externalTable: NotificationExternalTable.POST,
        postNotificationId: notification.id,
      },
    });

    this.server.to(ADMIN_ROOM).emit('onPublishRecipe', {
      message: 'Yêu cầu chia sẻ công thức mới',
    });
  }

  public async updateRecipes(userId: string, post: Post) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    const notification = await this.prismaService.postNotification.create({
      data: {
        title: 'Cập nhật công thức',
        content: `${user.fullName} yêu cầu cập nhật công thức ${post.title}`,
      },
    });

    await this.prismaService.notificationOnPost.create({
      data: {
        externalId: post.id,
        externalTable: NotificationExternalTable.POST,
        postNotificationId: notification.id,
      },
    });

    this.server.to(ADMIN_ROOM).emit('onPublishRecipe', {
      message: 'Yêu cầu cập nhật công thức',
    });
  }

  public async createPublishMealPlan(userId: string, mealPlan: MealPlan) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    const notification = await this.prismaService.postNotification.create({
      data: {
        title: 'Chia Sẻ Kế Hoạch Ăn Uống',
        content: `${user.fullName} yêu cầu chia sẻ kế hoạch ăn uống ${mealPlan.title}`,
      },
    });

    await this.prismaService.notificationOnPost.create({
      data: {
        externalId: mealPlan.id,
        externalTable: NotificationExternalTable.MEAL_PLAN,
        postNotificationId: notification.id,
      },
    });

    this.server.to(ADMIN_ROOM).emit('onPublishRecipe', {
      message: 'Yêu cầu chia sẻ công thức mới',
    });
  }

  public async updatePublishMealPlan(userId: string, mealPlan: MealPlan) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    const notification = await this.prismaService.postNotification.create({
      data: {
        title: 'Cập nhật Kế Hoạch Ăn Uống',
        content: `${user.fullName} yêu cầu cập nhật kế hoạch ${mealPlan.title}`,
      },
    });

    await this.prismaService.notificationOnPost.create({
      data: {
        externalId: mealPlan.id,
        externalTable: NotificationExternalTable.MEAL_PLAN,
        postNotificationId: notification.id,
      },
    });

    this.server.to(ADMIN_ROOM).emit('onPublishRecipe', {
      message: 'Yêu cầu cập nhật công thức',
    });
  }
}
