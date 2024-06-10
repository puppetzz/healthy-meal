import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { TFirebasePayload } from 'src/types/firebase-payload.type';
import { TResponse } from 'src/types/response-type';
import { PrismaService } from '../../services/database/prisma.service';
import { ERoleID } from '../../common/enums/role.enum';
import { auth } from 'firebase-admin';
import { TUserResponse } from '../../types/user-response';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  public async login(
    payload: TFirebasePayload,
  ): Promise<TResponse<TUserResponse>> {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: payload.uid,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      const newUser = await this.prismaService.user.create({
        data: {
          id: payload.uid,
          email: payload.email,
          fullName: payload.name,
          picture: payload.picture,
          roleId: ERoleID.USER,
        },
        include: {
          role: true,
        },
      });

      return {
        status: HttpStatus.CREATED,
        data: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          picture: newUser.picture,
          createdAt: newUser.createdAt,
          role: newUser.role.name,
        },
        message: 'Logged in successfully!',
      };
    }

    return {
      status: HttpStatus.OK,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        picture: user.picture,
        createdAt: user.createdAt,
        role: user.role.name,
      },
      message: 'Logged in successfully!',
    };
  }

  public async syncUserRole(uid: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: uid,
      },
      include: {
        role: true,
      },
    });

    if (!user) throw new BadRequestException('User not found');

    if (user.roleId === ERoleID.USER) return;

    await auth().setCustomUserClaims(uid, { role: user.role.name });
  }
}
