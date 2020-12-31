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
  private readonly logger = new Logger(CreateUserUsecase.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: CreateUserDto): Promise<Response> {
    this.logger.log('Creating user...');
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
      this.logger.debug(result.error);
      return left(Result.fail(result.error));
    }

    const username = userNameResult.getValue();
    const password = userPasswordResult.getValue();
    const email = userEmailResult.getValue();

    try {
      const userAlreadyExists = await this.userRepository.exists(email);
      if (userAlreadyExists) {
        const emailAlreadyExistsError = new CreateUserErrors.EmailAlreadyExistsError(
          email.value,
        );
        this.logger.debug(emailAlreadyExistsError.errorValue().message);
        return left(emailAlreadyExistsError);
      }

      const { found } = await this.userRepository.getUserByUsername(username);

      if (found) {
        const usernameTakenError = new CreateUserErrors.UsernameTakenError(
          username.value,
        );
        this.logger.debug(usernameTakenError.errorValue().message);
        return left(usernameTakenError);
      }

      const userEntityResult = UserEntity.create({
        username,
        password,
        email,
      });
      if (userEntityResult.isFailure) {
        this.logger.debug(userEntityResult.error.toString());
        return left(Result.fail(userEntityResult.error.toString()));
      }

      await this.userRepository.save(userEntityResult.getValue());
      this.logger.log('User successfully created');
      return right(Result.ok());
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
