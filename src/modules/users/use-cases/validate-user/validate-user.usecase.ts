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
import { UserPassword } from '../../domain/user-password.valueobject';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../repositories/user.repository';
import { ValidateUserDto } from './validate-user.dto';
import { ValidateUserErrors } from './validate-user.errors';

type Response = Either<
  | ValidateUserErrors.UserNameDoesntExistError
  | ValidateUserErrors.PasswordDoesntMatchError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<User>
>;

@Injectable()
export class ValidateUserUsecase implements UseCase<ValidateUserDto, Response> {
  private readonly logger = new Logger(ValidateUserUsecase.name);
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: ValidateUserDto): Promise<Response> {
    this.logger.log('Validating user...');
    const userNameResult = UserName.create(request.username);
    const userPasswordResult = UserPassword.create({
      value: request.password,
    });
    const result = Result.combine([userNameResult, userPasswordResult]);

    if (result.isFailure) {
      this.logger.error(result.error);
      return left(Result.fail(result.error));
    }

    try {
      const username = userNameResult.getValue();
      const password = userPasswordResult.getValue();

      const { found, user } = await this.userRepository.getUserByUsername(
        username,
      );
      if (!found) {
        const userNameDoesntExistError = new ValidateUserErrors.UserNameDoesntExistError();
        this.logger.debug(userNameDoesntExistError.errorValue().message);
        return left(userNameDoesntExistError);
      }

      const isPasswordValid = await user.password.comparePassword(
        password.value,
      );
      if (!isPasswordValid) {
        const passwordDoesntMatchError = new ValidateUserErrors.PasswordDoesntMatchError();
        this.logger.debug(passwordDoesntMatchError.errorValue().message);
        return left(passwordDoesntMatchError);
      }

      this.logger.log('User successfully validated');
      return right(Result.ok<User>(user));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
