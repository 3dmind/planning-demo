import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUserEntity } from './request-with-user-entity.interface';

export const UserEntity = createParamDecorator<undefined | 'userId'>(
  (prop, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUserEntity>();
    const { user } = request;
    return prop ? user?.[prop] : user;
  },
);
