import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseGuard } from './guards/firebase.guard';

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
}
