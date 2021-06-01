import { Injectable, Logger } from '@nestjs/common';
import { AppErrors, Either, left, Result, right, UseCase } from '../../../../shared/core';
import { AccessToken } from '../../domain/jwt';
import { JwtClaims } from '../../domain/jwt-claims.interface';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';
import { AuthService } from '../../services/auth.service';

type Response = Either<AppErrors.UnexpectedError, Result<AccessToken>>;

@Injectable()
export class RefreshAccessTokenUsecase implements UseCase<User, Response> {
  private readonly logger = new Logger(RefreshAccessTokenUsecase.name);

  constructor(private readonly userRepository: UserRepository, private readonly authService: AuthService) {}

  async execute(user: User): Promise<Response> {
    this.logger.log('User is going to refresh access token...');

    try {
      const savedTokens = await this.authService.getTokens(user.username.value);
      const payload: JwtClaims = {
        username: user.username.value,
      };
      const newAccessToken: AccessToken = this.authService.createAccessToken(payload);

      user.setTokens(newAccessToken, savedTokens.refreshToken);
      await this.authService.saveAuthenticatedUser(user);
      this.logger.log('Access token successfully refreshed');
      return right(Result.ok<AccessToken>(newAccessToken));
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
