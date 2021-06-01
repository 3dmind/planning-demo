import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUserEntity } from './request-with-user-entity.interface';

type UserEntityParams = 'userId' | undefined;

export const UserEntity = createParamDecorator<UserEntityParams>((prop, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithUserEntity>();
  const { user } = request;
  return prop ? user?.[prop] : user;
});
