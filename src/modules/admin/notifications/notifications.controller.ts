import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AdminGuard } from '../../auth/guards/admin.guard';

@Controller('/admin/notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Get()
  @UseGuards(AdminGuard)
  public async getNotifications() {
    return await this.notificationService.getAllNotification();
  }
}
