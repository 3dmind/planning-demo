import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { RequestWithUser } from './request-with-user.interface';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
