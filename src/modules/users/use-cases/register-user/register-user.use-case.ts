import { Injectable, Logger } from '@nestjs/common';
import { DomainEventPublisherService } from '../../../../domain-event-publisher/domain-event-publisher.service';
import { AppErrors, Either, left, Result, right, UseCase } from '../../../../shared/core';
import { UserEmail } from '../../domain/user-email.valueobject';
import { UserName } from '../../domain/user-name.valueobject';
import { UserPassword } from '../../domain/user-password.valueobject';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';
import { RegisterUserDto } from './register-user.dto';
import { RegisterUserErrors } from './register-user.errors';

type Response = Either<
  | RegisterUserErrors.EmailAlreadyExistsError
  | RegisterUserErrors.UsernameTakenError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<void>
>;

@Injectable()
export class RegisterUserUseCase implements UseCase<RegisterUserDto, Response> {
  private readonly logger = new Logger(RegisterUserUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly domainEventPublisherService: DomainEventPublisherService,
  ) {}

  async execute(request: RegisterUserDto): Promise<Response> {
    this.logger.log('Registering user...');
    const userNameResult = UserName.create(request.username);
    const userPasswordResult = UserPassword.create({
      value: request.password,
    });
    const userEmailResult = UserEmail.create(request.email);
    const result = Result.combine([userNameResult, userPasswordResult, userEmailResult]);

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
        const emailAlreadyExistsError = new RegisterUserErrors.EmailAlreadyExistsError(email.value);
        this.logger.debug(emailAlreadyExistsError.errorValue().message);
        return left(emailAlreadyExistsError);
      }

      const { found } = await this.userRepository.getUserByUsername(username);

      if (found) {
        const usernameTakenError = new RegisterUserErrors.UsernameTakenError(username.value);
        this.logger.debug(usernameTakenError.errorValue().message);
        return left(usernameTakenError);
      }

      const userResult = User.register({
        username,
        password,
        email,
      });
      if (userResult.isFailure) {
        this.logger.debug(userResult.error.toString());
        return left(Result.fail(userResult.error.toString()));
      }

      const user = userResult.getValue();
      await this.userRepository.save(user);
      this.domainEventPublisherService.publish(user);

      this.logger.log('User successfully registered');
      return right(Result.ok());
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
