import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseStrategy } from './strategies/firebase.strategy';

@Module({
  imports: [DrizzleModule],
  providers: [AuthService, FirebaseStrategy],
  controllers: [AuthController],
  exports: [FirebaseStrategy],
})
export class AuthModule {}
