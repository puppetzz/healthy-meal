import { AuthGuard } from '@nestjs/passport';

export class FirebaseGuard extends AuthGuard('firebase') {}
