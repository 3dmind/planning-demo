import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserId } from '../domain/user-id.entity';
import { RequestWithUser } from './request-with-user.interface';

export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserId => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user.userId;
  },
);
