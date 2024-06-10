import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { GetUsersDTO } from '../../../common/dto/admin/get-users.dto';
import { UserManagementService } from './user-management.service';

@Controller('admin/users')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @UseGuards(AdminGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  public async getUsers(@Query() getusersDTO: GetUsersDTO) {
    return await this.userManagementService.getUsers(getusersDTO);
  }
}
