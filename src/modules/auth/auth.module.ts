import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseStrategy } from './strategies/firebase.strategy';
import { PrismaService } from '../../services/database/prisma.service';

@Module({
  providers: [AuthService, FirebaseStrategy, PrismaService],
  controllers: [AuthController],
  exports: [FirebaseStrategy],
})
export class AuthModule {}
