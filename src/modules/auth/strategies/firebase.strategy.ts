import { PassportStrategy } from '@nestjs/passport';
import { cert, initializeApp, ServiceAccount } from 'firebase-admin/app';
import { Strategy } from 'passport-http-bearer';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { auth } from 'firebase-admin';
import { FirebasePayload } from 'src/types/firebase-payload.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor(private configService: ConfigService) {
    super();

    initializeApp({
      credential: cert({
        projectId: this.configService.get('FIREBASE_PROJECT_ID'),
        clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.configService.get('FIREBASE_PRIVATE_KEY'),
      } as ServiceAccount),
    });
  }

  async validate(token: string): Promise<FirebasePayload> {
    try {
      const decodedToken = await auth().verifyIdToken(token);

      return {
        uid: decodedToken.uid,
        name: decodedToken.name,
        picture: decodedToken.picture,
        email: decodedToken.email,
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
