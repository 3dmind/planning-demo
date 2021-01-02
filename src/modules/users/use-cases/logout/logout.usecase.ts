import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../shared/core';
import { UserName } from '../../domain/user-name.valueobject';
import { UserRepository } from '../../repositories/user.repository';
import { AuthService } from '../../services/auth.service';
import { LogoutDto } from './logout.dto';
import { LogoutErrors } from './logout.errors';

type Response = Either<
  LogoutErrors.UserNotFoundError | AppErrors.UnexpectedError | Result<any>,
  Result<void>
>;

@Injectable()
export class LogoutUsecase implements UseCase<LogoutDto, Response> {
  private readonly logger = new Logger(LogoutUsecase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  public async execute(request: LogoutDto): Promise<Response> {
    this.logger.log('User is going to log out...');
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
        const userNotFoundError = new LogoutErrors.UserNotFoundError(
          username.value,
        );
        this.logger.debug(userNotFoundError.errorValue().message);
        return left(userNotFoundError);
      }

      await this.authService.deAuthenticateUser(user);
      this.logger.log('User successfully logged out');
      return right(Result.ok<void>());
    } catch (error) {
      this.logger.error(error.message);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
