import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCaseInterface,
} from '../../../../shared/core';
import { AuthService } from '../../auth.service';
import { JwtToken } from '../../domain/jwt';
import { JwtClaimsInterface } from '../../domain/jwt-claims.interface';
import { UserEntity } from '../../domain/user.entity';
import { LoginResponseDto } from './login-response.dto';

type Response = Either<AppErrors.UnexpectedError, Result<LoginResponseDto>>;

@Injectable()
export class LoginUseCase implements UseCaseInterface<UserEntity, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly authService: AuthService,
  ) {
    this.logger.setContext('LoginUseCase');
  }

  async execute(validatedUser: UserEntity): Promise<Response> {
    try {
      const userSnapshot = validatedUser.createSnapshot();
      const payload: JwtClaimsInterface = {
        username: userSnapshot.username.value,
      };
      const accessToken: JwtToken = this.authService.createAccessToken(payload);
      const refreshToken: JwtToken = this.authService.createRefreshToken(
        payload,
      );
      return right(
        Result.ok<LoginResponseDto>({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      );
    } catch (error) {
      this.logger.error(error.message, error);
      return left(AppErrors.UnexpectedError.create(error));
    }
  }
}
