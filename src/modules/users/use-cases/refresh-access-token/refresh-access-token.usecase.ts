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
import { AccessToken } from '../../domain/jwt';
import { JwtClaimsInterface } from '../../domain/jwt-claims.interface';
import { UserNameValueObject } from '../../domain/user-name.value-object';
import { UserRepository } from '../../user.repository';
import { RefreshAccessTokenRequestDto } from './refresh-access-token-request.dto';
import { RefreshAccessTokenErrors } from './refresh-access-token.errors';

type Response = Either<
  | RefreshAccessTokenErrors.UserNotFoundError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<AccessToken>
>;

@Injectable()
export class RefreshAccessTokenUseCase
  implements UseCaseInterface<RefreshAccessTokenRequestDto, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {
    this.logger.setContext(RefreshAccessTokenUseCase.name);
  }

  async execute(request: RefreshAccessTokenRequestDto): Promise<Response> {
    const userNameResult = UserNameValueObject.create(request.username);

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
      const payload: JwtClaimsInterface = {
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
