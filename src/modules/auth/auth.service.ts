import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from 'src/common/constants/general';
import { FirebasePayload } from 'src/types/firebase-payload.type';
import { User } from 'src/types/schema/user.type';
import { ResponseType } from 'src/types/response-type';
import { Database } from '../../types/drizzle-database/drizzle-database.type';
import { users } from '../../schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE_PROVIDER)
    private readonly db: Database,
  ) {}

  public async login(payload: FirebasePayload): Promise<ResponseType<User>> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, payload.uid),
    });

    if (!user) {
      const newUser = await this.db
        .insert(users)
        .values({
          id: payload.uid,
          fullName: payload.name,
          email: payload.email,
          picture: payload.picture,
        })
        .returning();

      return {
        status: HttpStatus.CREATED,
        message: 'Login Success!',
        data: newUser[0],
      };
    }
    return {
      status: HttpStatus.OK,
      message: 'Login Success!',
      data: user,
    };
  }
}
