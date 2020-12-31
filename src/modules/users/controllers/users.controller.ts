import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Username } from '../../../decorators/username.decorator';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { AppErrors } from '../../../shared/core';
import { User } from '../decorators/user.decorator';
import { AccessToken } from '../domain/jwt';
import { UserEntity } from '../domain/user.entity';
import { UserDto } from '../dtos/user.dto';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { UserMapper } from '../mappers/user.mapper';
import { CreateUserDto } from '../use-cases/create-user/create-user.dto';
import { CreateUserErrors } from '../use-cases/create-user/create-user.errors';
import { CreateUserUsecase } from '../use-cases/create-user/create-user.usecase';
import { GetUserByUserNameError } from '../use-cases/get-user-by-user-name/get-user-by-user-name.errors';
import { GetUserByUserNameUsecase } from '../use-cases/get-user-by-user-name/get-user-by-user-name.usecase';
import { LoginResponseDto } from '../use-cases/login/login-response.dto';
import { LoginUsecase } from '../use-cases/login/login.usecase';
import { LogoutErrors } from '../use-cases/logout/logout.errors';
import { LogoutUsecase } from '../use-cases/logout/logout.usecase';
import { RefreshAccessTokenResponseDto } from '../use-cases/refresh-access-token/refresh-access-token-response.dto';
import { RefreshAccessTokenErrors } from '../use-cases/refresh-access-token/refresh-access-token.errors';
import { RefreshAccessTokenUsecase } from '../use-cases/refresh-access-token/refresh-access-token.usecase';
import { RefreshTokenDto } from '../use-cases/refresh-access-token/refresh-token.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUsecase: CreateUserUsecase,
    private readonly loginUsecase: LoginUsecase,
    private readonly getUserByUserNameUsecase: GetUserByUserNameUsecase,
    private readonly refreshAccessTokenUsecase: RefreshAccessTokenUsecase,
    private readonly logoutUsecase: LogoutUsecase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createTaskDto: CreateUserDto): Promise<void> {
    const result = await this.createUserUsecase.execute(createTaskDto);

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        case CreateUserErrors.EmailAlreadyExistsError:
        case CreateUserErrors.UsernameTakenError:
          throw new ConflictException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@User() validatedUser: UserEntity): Promise<LoginResponseDto> {
    const result = await this.loginUsecase.execute(validatedUser);

    if (result.isLeft()) {
      const error = result.value;
      throw new InternalServerErrorException(error.errorValue().message);
    }

    return result.value.getValue();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getCurrentUser(@Username() username: string): Promise<UserDto> {
    const result = await this.getUserByUserNameUsecase.execute({ username });

    if (result.isRight()) {
      const userEntity = result.value.getValue();
      return UserMapper.toDto(userEntity);
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case GetUserByUserNameError.UserNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(
    @Username() username: string,
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshAccessTokenResponseDto> {
    const result = await this.refreshAccessTokenUsecase.execute({ username });

    if (result.isRight()) {
      const accessToken: AccessToken = result.value.getValue();
      return {
        access_token: accessToken,
        refresh_token: refreshTokenDto.refresh_token,
      };
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case RefreshAccessTokenErrors.UserNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Username() username: string): Promise<void> {
    const result = await this.logoutUsecase.execute({ username });
    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case LogoutErrors.UserNotFoundError:
          throw new NotFoundException(error.errorValue().messge);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }
}
