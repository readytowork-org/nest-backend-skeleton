import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../../../common/types/type/auth.type';

interface RequestWithUser extends Request {
  user: AuthUser;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
