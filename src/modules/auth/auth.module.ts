import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseStrategy } from './strategies/firebase.strategy';
import { PrismaService } from '../../services/database/prisma.service';
import { PermissiveAuthStrategy } from './strategies/auth.strategy';
import { AdminStrategy } from './strategies/admin.strategy';

@Module({
  providers: [
    AuthService,
    FirebaseStrategy,
    PrismaService,
    PermissiveAuthStrategy,
    AdminStrategy,
  ],
  controllers: [AuthController],
  exports: [FirebaseStrategy, PermissiveAuthStrategy, AdminStrategy],
})
export class AuthModule {}
