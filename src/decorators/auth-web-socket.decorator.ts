import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WSAuthUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    const authUser = client['user'];
    if (authUser === 'anonymous') return null;
    return data ? authUser?.[data] : authUser;
  },
);
