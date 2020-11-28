import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCaseInterface,
} from '../../../../shared/core';
import { JwtToken } from '../../domain/jwt';
import { JwtClaimsInterface } from '../../domain/jwt-claims.interface';
import { UserEntity } from '../../domain/user.entity';
import { LoginResponseDto } from './login-response.dto';

type Response = Either<AppErrors.UnexpectedError, Result<LoginResponseDto>>;

@Injectable()
export class LoginUseCase implements UseCaseInterface<UserEntity, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
  ) {
    this.logger.setContext('LoginUseCase');
  }

  async execute(validatedUser: UserEntity): Promise<Response> {
    try {
      const userSnapshot = validatedUser.createSnapshot();
      const payload: JwtClaimsInterface = {
        email: userSnapshot.email.value,
        isEmailVerified: userSnapshot.isEmailVerified,
        userId: userSnapshot.userId.id.toString(),
        username: userSnapshot.username.value,
      };
      const accessToken: JwtToken = this.jwtService.sign(payload);
      return right(
        Result.ok<LoginResponseDto>({ access_token: accessToken }),
      );
    } catch (error) {
      this.logger.error(error.message, error);
      return left(AppErrors.UnexpectedError.create(error));
    }
  }
}
