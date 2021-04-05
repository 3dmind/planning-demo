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
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';
import { GetUserByUserNameDto } from './get-user-by-user-name.dto';
import { GetUserByUserNameError } from './get-user-by-user-name.errors';

type Response = Either<
  | GetUserByUserNameError.UserNotFoundError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<User>
>;

@Injectable()
export class GetUserByUserNameUsecase
  implements UseCase<GetUserByUserNameDto, Response> {
  private readonly logger = new Logger(GetUserByUserNameUsecase.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: GetUserByUserNameDto): Promise<Response> {
    this.logger.log('Getting user by the username...');
    const userNameResult = UserName.create(request.username);

    if (userNameResult.isFailure) {
      this.logger.debug(userNameResult.error.toString());
      return left(Result.fail(userNameResult.error.toString()));
    }

    const username = userNameResult.getValue();

    try {
      const { found, user } = await this.userRepository.getUserByUsername(
        username,
      );

      if (!found) {
        const userNotFoundError = new GetUserByUserNameError.UserNotFoundError(
          username.value,
        );
        this.logger.debug(userNotFoundError.errorValue().message);
        return left(userNotFoundError);
      }

      this.logger.log('User successfully found');
      return right(Result.ok<User>(user));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
