import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ApiConfigService } from '../../../api-config/api-config.service';
import { AppErrors } from '../../../shared/core';
import { RefreshToken } from '../domain/jwt';
import { JwtClaims } from '../domain/jwt-claims.interface';
import { User } from '../domain/user.entity';
import { AuthService } from '../services/auth.service';
import { GetUserByUserNameError } from '../use-cases/get-user-by-user-name/get-user-by-user-name.errors';
import { GetUserByUserNameUseCase } from '../use-cases/get-user-by-user-name/get-user-by-user-name.use-case';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'JwtRefreshToken') {
  public static extractor = ExtractJwt.fromBodyField('refreshToken');

  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly authService: AuthService,
    private readonly getUserByUserNameUsecase: GetUserByUserNameUseCase,
  ) {
    super({
      jwtFromRequest: JwtRefreshTokenStrategy.extractor,
      ignoreExpiration: false,
      secretOrKey: apiConfigService.getRefreshTokenSecret(),
      passReqToCallback: true,
    });
  }

  public async validate(request: Request, decodedToken: JwtClaims): Promise<User> {
    const refreshToken: RefreshToken = JwtRefreshTokenStrategy.extractor(request);
    const { username } = decodedToken;

    const isValidToken = await this.authService.validateRefreshToken(username, refreshToken);
    if (!isValidToken) {
      throw new ForbiddenException('Refresh token not found.', 'User is probably not logged in. Please log in again.');
    }

    const result = await this.getUserByUserNameUsecase.execute({ username });
    if (result.isRight()) {
      return result.value.getValue();
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (Reflect.getPrototypeOf(error).constructor) {
        case GetUserByUserNameError.UserNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }
}
