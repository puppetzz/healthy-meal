import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { auth } from 'firebase-admin';

@Injectable()
export class PermissiveAuthStrategy extends PassportStrategy(Strategy, 'auth') {
  constructor(private configService: ConfigService) {
    super(async (req, done) => {
      if (!req.headers.authorization) {
        done(null, 'anonymous');
        return;
      }
      const token = req.headers.authorization.split(' ')[1];

      try {
        const decodedToken = await auth().verifyIdToken(token);
        done(null, decodedToken);
      } catch (error) {
        done(error, null);
      }
    });
  }
}
