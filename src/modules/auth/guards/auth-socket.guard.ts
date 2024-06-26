import { CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { auth } from 'firebase-admin';
import { Socket } from 'socket.io';

export class AuthSocketGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = context.switchToWs().getClient<Socket>().handshake
      .headers?.authorization;

    if (!token) return false;

    const claims = await auth().verifyIdToken(token);

    if (!claims) return false;

    const user = {
      uid: claims.uid,
      name: claims.name,
      picture: claims.picture,
      email: claims.email,
    };

    context.switchToWs().getClient().user = user;

    return true;
  }
}
