import { HttpStatus, Injectable } from '@nestjs/common';
import { TFirebasePayload } from 'src/types/firebase-payload.type';
import { TResponse } from 'src/types/response-type';
import { PrismaService } from '../../services/database/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  public async login(payload: TFirebasePayload): Promise<TResponse<User>> {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: payload.uid,
      },
    });

    if (!user) {
      const newUser = await this.prismaService.user.create({
        data: {
          id: payload.uid,
          email: payload.email,
          fullName: payload.name,
          picture: payload.picture,
        },
      });

      return {
        status: HttpStatus.CREATED,
        data: newUser,
        message: 'Logged in successfully!',
      };
    }

    return {
      status: HttpStatus.OK,
      data: user,
      message: 'Logged in successfully!',
    };
  }
}
