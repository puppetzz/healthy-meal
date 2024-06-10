import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseGuard } from './guards/firebase.guard';
import { SyncRoleDTO } from '../../common/dto/auth/sync-role.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(FirebaseGuard)
  public async login(@Req() req) {
    const payload = req.user;

    const response = await this.authService.login(payload);

    return response;
  }

  @Post('sync-role')
  public async syncRole(@Body() syncRoleDTO: SyncRoleDTO) {
    await this.authService.syncUserRole(syncRoleDTO.uid);
  }
}
