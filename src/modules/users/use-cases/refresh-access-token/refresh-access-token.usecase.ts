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
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {
    this.logger.setContext(RefreshAccessTokenUsecase.name);
  }

  async execute(request: RefreshAccessTokenRequestDto): Promise<Response> {
    const userNameResult = UserName.create(request.username);

    if (userNameResult.isFailure) {
      return left(Result.fail(userNameResult.error.toString()));
    }

    try {
      const username = userNameResult.getValue();
      const { found, userEntity } = await this.userRepository.getUserByUsername(
        username,
      );

      if (!found) {
        return left(
          RefreshAccessTokenErrors.UserNotFoundError.create(username.value),
        );
      }

      const savedTokens = await this.authService.getTokens(username.value);
      const payload: JwtClaims = {
        username: username.value,
      };
      const newAccessToken: AccessToken = this.authService.createAccessToken(
        payload,
      );

      userEntity.setTokens(newAccessToken, savedTokens.refreshToken);
      await this.authService.saveAuthenticatedUser(userEntity);

      return right(Result.ok<AccessToken>(newAccessToken));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(AppErrors.UnexpectedError.create(error));
    }
  }
}
