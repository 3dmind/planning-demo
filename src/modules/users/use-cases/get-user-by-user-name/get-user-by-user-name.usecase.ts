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
import { UserEntity } from '../../domain/user.entity';
import { UserRepository } from '../../repositories/user.repository';
import { GetUserByUserNameDto } from './get-user-by-user-name.dto';
import { GetUserByUserNameError } from './get-user-by-user-name.errors';

type Response = Either<
  | GetUserByUserNameError.UserNotFoundError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<UserEntity>
>;

@Injectable()
export class GetUserByUserNameUsecase
  implements UseCaseInterface<GetUserByUserNameDto, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly userRepository: UserRepository,
  ) {
    this.logger.setContext(GetUserByUserNameUsecase.name);
  }

  async execute(request: GetUserByUserNameDto): Promise<Response> {
    const userNameResult = UserNameValueObject.create(request.username);

    if (userNameResult.isFailure) {
      return left(Result.fail(userNameResult.error.toString()));
    }

    const username = userNameResult.getValue();

    try {
      const { found, userEntity } = await this.userRepository.getUserByUsername(
        username,
      );

      if (!found) {
        return left(
          GetUserByUserNameError.UserNotFoundError.create(username.value),
        );
      }

      return right(Result.ok<UserEntity>(userEntity));
    } catch (error) {
      return left(AppErrors.UnexpectedError.create(error));
    }
  }
}
