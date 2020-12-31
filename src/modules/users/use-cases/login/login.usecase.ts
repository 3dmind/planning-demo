import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../shared/core';
import { AccessToken, RefreshToken } from '../../domain/jwt';
import { JwtClaims } from '../../domain/jwt-claims.interface';
import { UserEntity } from '../../domain/user.entity';
import { AuthService } from '../../services/auth.service';
import { LoginResponseDto } from './login-response.dto';

type Response = Either<AppErrors.UnexpectedError, Result<LoginResponseDto>>;

@Injectable()
export class LoginUsecase implements UseCase<UserEntity, Response> {
  private readonly logger = new Logger(LoginUsecase.name);

  constructor(private readonly authService: AuthService) {}

  async execute(user: UserEntity): Promise<Response> {
    this.logger.log('User is going to log in...');
    try {
      const userSnapshot = user.createSnapshot();
      const payload: JwtClaims = {
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

      this.logger.log('User successfully logged in');
      return right(
        Result.ok<LoginResponseDto>({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      );
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
