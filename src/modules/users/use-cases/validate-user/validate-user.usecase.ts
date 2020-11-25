import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCaseInterface,
} from '../../../../shared/core';
import { UserNameValueObject } from '../../domain/user-name.value-object';
import { UserPasswordValueObject } from '../../domain/user-password.value-object';
import { UserEntity } from '../../domain/user.entity';
import { UserRepository } from '../../user.repository';
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
export class ValidateUserUseCase
  implements UseCaseInterface<ValidateUserDto, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
  ) {
    this.logger.setContext('ValidateUserUseCase');
  }

  async execute(request: ValidateUserDto): Promise<Response> {
    const userNameResult = UserNameValueObject.create(request.username);
    const userPasswordResult = UserPasswordValueObject.create({
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
