import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AppErrors } from '../../../shared/core';
import { User } from '../domain/user.entity';
import { ValidateUserErrors } from '../use-cases/validate-user/validate-user.errors';
import { ValidateUserUseCase } from '../use-cases/validate-user/validate-user.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly validateUserUseCase: ValidateUserUseCase) {
    super();
  }

  public async validate(username: string, password: string): Promise<User> {
    const result = await this.validateUserUseCase.execute({
      username,
      password,
    });

    if (result.isRight()) {
      return result.value.getValue();
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ValidateUserErrors.UserNameDoesntExistError:
        case ValidateUserErrors.PasswordDoesntMatchError:
          throw new UnauthorizedException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnauthorizedException(error.errorValue());
      }
    }
  }
}
