import { CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { auth } from 'firebase-admin';
import { ERole } from '../../../common/enums/role.enum';
import { Socket } from 'socket.io';

export class AdminWebSocketGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = context.switchToWs().getClient<Socket>().handshake
      .headers?.authorization;

    if (!token) throw new WsException('Unauthorized!');

    const claims = await auth().verifyIdToken(token);

    if (!claims.role) throw new WsException('Unauthorized!');

    if (claims.role !== ERole.ADMIN) throw new WsException('Unauthorized!');

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
