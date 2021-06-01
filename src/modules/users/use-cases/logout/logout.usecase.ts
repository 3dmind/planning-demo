import { Injectable, Logger } from '@nestjs/common';
import { AppErrors, Either, left, Result, right, UseCase } from '../../../../shared/core';
import { User } from '../../domain/user.entity';
import { AuthService } from '../../services/auth.service';

type Response = Either<AppErrors.UnexpectedError, Result<void>>;

@Injectable()
export class LogoutUsecase implements UseCase<User, Response> {
  private readonly logger = new Logger(LogoutUsecase.name);

  constructor(private readonly authService: AuthService) {}

  public async execute(user: User): Promise<Response> {
    this.logger.log('User is going to log out...');

    try {
      await this.authService.deAuthenticateUser(user);
      this.logger.log('User successfully logged out');
      return right(Result.ok<void>());
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
