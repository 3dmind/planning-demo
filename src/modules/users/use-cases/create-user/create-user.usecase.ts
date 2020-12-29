import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../shared/core';
import { UserEmail } from '../../domain/user-email.valueobject';
import { UserName } from '../../domain/user-name.valueobject';
import { UserPassword } from '../../domain/user-password.valueobject';
import { UserEntity } from '../../domain/user.entity';
import { UserRepository } from '../../repositories/user.repository';
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
export class CreateUserUsecase implements UseCase<CreateUserDto, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
  ) {
    this.logger.setContext('CreateUserUsecase');
  }

  async execute(request: CreateUserDto): Promise<Response> {
    const userNameResult = UserName.create(request.username);
    const userPasswordResult = UserPassword.create({
      value: request.password,
    });
    const userEmailResult = UserEmail.create(request.email);
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
