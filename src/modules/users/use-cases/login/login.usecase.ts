import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCaseInterface,
} from '../../../../shared/core';
import { AccessToken, RefreshToken } from '../../domain/jwt';
import { JwtClaimsInterface } from '../../domain/jwt-claims.interface';
import { UserEntity } from '../../domain/user.entity';
import { AuthService } from '../../services/auth.service';
import { LoginResponseDto } from './login-response.dto';

type Response = Either<AppErrors.UnexpectedError, Result<LoginResponseDto>>;

@Injectable()
export class LoginUsecase implements UseCaseInterface<UserEntity, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly authService: AuthService,
  ) {
    this.logger.setContext('LoginUsecase');
  }

  async execute(user: UserEntity): Promise<Response> {
    try {
      const userSnapshot = user.createSnapshot();
      const payload: JwtClaimsInterface = {
        username: userSnapshot.username.value,
      };
      const accessToken: AccessToken = this.authService.createAccessToken(
        payload,
      );
      const refreshToken: RefreshToken = this.authService.createRefreshToken(
        payload,
      );

      user.setTokens(accessToken, refreshToken);
      await this.authService.saveAuthenticatedUser(user);

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
