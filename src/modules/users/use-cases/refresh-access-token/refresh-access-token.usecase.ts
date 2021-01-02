import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../shared/core';
import { AccessToken } from '../../domain/jwt';
import { JwtClaims } from '../../domain/jwt-claims.interface';
import { UserName } from '../../domain/user-name.valueobject';
import { UserRepository } from '../../repositories/user.repository';
import { AuthService } from '../../services/auth.service';
import { RefreshAccessTokenRequestDto } from './refresh-access-token-request.dto';
import { RefreshAccessTokenErrors } from './refresh-access-token.errors';

type Response = Either<
  | RefreshAccessTokenErrors.UserNotFoundError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<AccessToken>
>;

@Injectable()
export class RefreshAccessTokenUsecase
  implements UseCase<RefreshAccessTokenRequestDto, Response> {
  private readonly logger = new Logger(RefreshAccessTokenUsecase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(request: RefreshAccessTokenRequestDto): Promise<Response> {
    this.logger.log('User is going to refresh access token...');
    const userNameResult = UserName.create(request.username);

    if (userNameResult.isFailure) {
      this.logger.debug(userNameResult.error.toString());
      return left(Result.fail(userNameResult.error.toString()));
    }

    try {
      const username = userNameResult.getValue();
      const { found, user } = await this.userRepository.getUserByUsername(
        username,
      );

      if (!found) {
        const userNotFoundError = new RefreshAccessTokenErrors.UserNotFoundError(
          username.value,
        );
        this.logger.debug(userNotFoundError.errorValue().message);
        return left(userNotFoundError);
      }

      const savedTokens = await this.authService.getTokens(username.value);
      const payload: JwtClaims = {
        username: username.value,
      };
      const newAccessToken: AccessToken = this.authService.createAccessToken(
        payload,
      );

      user.setTokens(newAccessToken, savedTokens.refreshToken);
      await this.authService.saveAuthenticatedUser(user);
      this.logger.log('Access token successfully refreshed');
      return right(Result.ok<AccessToken>(newAccessToken));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
