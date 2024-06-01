import { AuthGuard } from '@nestjs/passport';

export class PermissiveAuthGuard extends AuthGuard('auth') {}
