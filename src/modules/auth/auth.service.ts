import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_PROVIDER } from 'src/common/constants/general';
import * as schema from 'src/schema';
import { FirebasePayload } from 'src/types/firebase-payload.type';
import { User } from 'src/types/schema/user.type';
import { ResponseType } from 'src/types/response-type';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE_PROVIDER)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  public async login(payload: FirebasePayload): Promise<ResponseType<User>> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, payload.uid),
    });

    if (!user) {
      const newUser = await this.db
        .insert(schema.users)
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
