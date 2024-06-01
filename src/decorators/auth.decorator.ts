import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authUser = request['user'];
    if (authUser === 'anonymous') return null;
    return data ? authUser?.[data] : authUser;
  },
);
