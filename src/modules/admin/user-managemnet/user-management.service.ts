import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../services/database/prisma.service';
import { GetUsersDTO } from '../../../common/dto/admin/get-users.dto';
import { TResponse } from '../../../types/response-type';
import { TUsersPaginationResponse } from '../../../types/user-pagination-response';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserManagementService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getUsers(
    getUsersDTO: GetUsersDTO,
  ): Promise<TResponse<TUsersPaginationResponse>> {
    const { page, pageSize, search } = getUsersDTO;

    const skip = pageSize ? (page - 1) * pageSize : 0;
    const take = pageSize;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            {
              fullName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};

    const users = await this.prismaService.user.findMany({
      where: {
        ...where,
      },
      include: {
        role: true,
      },
      skip,
      take,
    });

    const numberOfUsers = await this.prismaService.user.count({
      where: {
        ...where,
      },
    });

    const total = Math.ceil(numberOfUsers / pageSize);

    return {
      data: {
        users,
        total,
        page,
      },
      message: 'Get users data successfully!',
      status: HttpStatus.OK,
    };
  }
}
