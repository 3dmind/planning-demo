import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserId } from '../domain/user-id.entity';
import { User } from '../domain/user.entity';
import { RequestWithUser } from './request-with-user.interface';

export const GetUser = createParamDecorator<undefined | 'userId'>(
  (prop, ctx: ExecutionContext): User | UserId => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return prop ? user?.[prop] : user;
  },
);
