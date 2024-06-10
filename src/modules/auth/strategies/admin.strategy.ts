import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { TFirebasePayload } from '../../../types/firebase-payload.type';
import { auth } from 'firebase-admin';
import { ERole } from '../../../common/enums/role.enum';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  async validate(token: string): Promise<TFirebasePayload> {
    try {
      const claims = await auth().verifyIdToken(token);

      if (!claims?.role) {
        throw new ForbiddenException();
      }

      if (claims.role !== ERole.ADMIN) {
        throw new ForbiddenException();
      }

      return {
        uid: claims.uid,
        name: claims.name,
        picture: claims.picture,
        email: claims.email,
      };
    } catch (error) {
      if (error.status === 403) {
        throw new ForbiddenException();
      }
      throw new UnauthorizedException();
    }
  }
}
