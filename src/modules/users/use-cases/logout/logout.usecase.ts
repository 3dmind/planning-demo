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
import { UserNameValueObject } from '../../domain/user-name.value-object';
import { UserRepository } from '../../user.repository';
import { LogoutDto } from './logout.dto';
import { LogoutErrors } from './logout.errors';

type Response = Either<
  LogoutErrors.UserNotFoundError | AppErrors.UnexpectedError | Result<any>,
  Result<void>
>;

@Injectable()
export class LogoutUseCase implements UseCaseInterface<LogoutDto, Response> {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  public async execute(request: LogoutDto): Promise<Response> {
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
        return left(LogoutErrors.UserNotFoundError.create(username.value));
      }

      await this.authService.deAuthenticateUser(userEntity);
      return right(Result.ok<void>());
    } catch (error) {
      this.logger.error(error.message);
      return left(AppErrors.UnexpectedError.create(error));
    }
  }
}
