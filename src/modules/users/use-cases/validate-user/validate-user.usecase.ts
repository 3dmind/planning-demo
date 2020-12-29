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
import { UserEntity } from '../../domain/user.entity';
import { UserRepository } from '../../repositories/user.repository';
import { ValidateUserDto } from './validate-user.dto';
import { ValidateUserErrors } from './validate-user.errors';

type Response = Either<
  | ValidateUserErrors.UserNameDoesntExistError
  | ValidateUserErrors.PasswordDoesntMatchError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<UserEntity>
>;

@Injectable()
export class ValidateUserUsecase implements UseCase<ValidateUserDto, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
  ) {
    this.logger.setContext('ValidateUserUsecase');
  }

  async execute(request: ValidateUserDto): Promise<Response> {
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

      const { found, userEntity } = await this.userRepository.getUserByUsername(
        username,
      );
      if (!found) {
        return left(ValidateUserErrors.UserNameDoesntExistError.create());
      }

      const isPasswordValid = await userEntity.password.comparePassword(
        password.value,
      );
      if (!isPasswordValid) {
        return left(ValidateUserErrors.PasswordDoesntMatchError.create());
      }

      return right(Result.ok<UserEntity>(userEntity));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(AppErrors.UnexpectedError.create(error));
    }
  }
}
