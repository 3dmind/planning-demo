import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCaseInterface,
} from '../../../../shared/core';
import { UserEmailValueObject } from '../../domain/user-email.value-object';
import { UserNameValueObject } from '../../domain/user-name.value-object';
import { UserPasswordValueObject } from '../../domain/user-password.value-object';
import { UserEntity } from '../../domain/user.entity';
import { UserRepository } from '../../user.repository';
import { CreateUserDto } from './create-user.dto';
import { CreateUserErrors } from './create-user.errors';

type Response = Either<
  | CreateUserErrors.EmailAlreadyExistsError
  | CreateUserErrors.UsernameTakenError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<void>
>;

@Injectable()
export class CreateUserUseCase
  implements UseCaseInterface<CreateUserDto, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
  ) {
    this.logger.setContext('CreateUserUseCase');
  }

  async execute(request: CreateUserDto): Promise<Response> {
    const userNameResult = UserNameValueObject.create(request.username);
    const userPasswordResult = UserPasswordValueObject.create({
      value: request.password,
    });
    const userEmailResult = UserEmailValueObject.create(request.email);
    const result = Result.combine([
      userNameResult,
      userPasswordResult,
      userEmailResult,
    ]);

    if (result.isFailure) {
      this.logger.error(result.error);
      return left(Result.fail(result.error)) as Response;
    }

    const username = userNameResult.getValue();
    const password = userPasswordResult.getValue();
    const email = userEmailResult.getValue();

    try {
      const userAlreadyExists = await this.userRepository.exists(email);
      if (userAlreadyExists) {
        return left(
          CreateUserErrors.EmailAlreadyExistsError.create(email.value),
        ) as Response;
      }

      const { found } = await this.userRepository.getUserByUsername(username);

      if (found) {
        return left(
          CreateUserErrors.UsernameTakenError.create(username.value),
        ) as Response;
      }

      const userEntityResult = UserEntity.create({
        username,
        password,
        email,
      });
      if (userEntityResult.isFailure) {
        return left(Result.fail(userEntityResult.error.toString())) as Response;
      }

      await this.userRepository.save(userEntityResult.getValue());
      return right(Result.ok());
    } catch (error) {
      this.logger.error(error.message, error);
      return left(AppErrors.UnexpectedError.create(error)) as Response;
    }
  }
}
