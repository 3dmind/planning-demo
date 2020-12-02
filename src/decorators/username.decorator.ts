import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtClaimsInterface } from '../modules/users/domain/jwt-claims.interface';

interface RequestWithDecodedToken extends Request {
  user: JwtClaimsInterface;
}

export const Username = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithDecodedToken>();
    return request.user.username;
  },
);
