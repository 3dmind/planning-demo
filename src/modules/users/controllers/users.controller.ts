import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { UserEntity } from '../../../decorators/user-entity.decorator';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { AppErrors } from '../../../shared/core';
import { AccessToken } from '../domain/jwt';
import { User } from '../domain/user.entity';
import { UserDto } from '../dtos/user.dto';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { UserMapper } from '../mappers/user.mapper';
import { GetUserByUserNameUseCase } from '../use-cases/get-user-by-user-name/get-user-by-user-name.use-case';
import { LoginResponseDto } from '../use-cases/login/login-response.dto';
import { LoginUseCase } from '../use-cases/login/login.use-case';
import { LogoutUseCase } from '../use-cases/logout/logout.use-case';
import { RefreshAccessTokenResponseDto } from '../use-cases/refresh-access-token/refresh-access-token-response.dto';
import { RefreshAccessTokenUseCase } from '../use-cases/refresh-access-token/refresh-access-token.use-case';
import { RefreshTokenDto } from '../use-cases/refresh-access-token/refresh-token.dto';
import { RegisterUserDto } from '../use-cases/register-user/register-user.dto';
import { RegisterUserErrors } from '../use-cases/register-user/register-user.errors';
import { RegisterUserUseCase } from '../use-cases/register-user/register-user.use-case';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUsecase: RegisterUserUseCase,
    private readonly loginUsecase: LoginUseCase,
    private readonly getUserByUserNameUsecase: GetUserByUserNameUseCase,
    private readonly refreshAccessTokenUsecase: RefreshAccessTokenUseCase,
    private readonly logoutUsecase: LogoutUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() registerUserDto: RegisterUserDto): Promise<void> {
    const result = await this.createUserUsecase.execute(registerUserDto);

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        case RegisterUserErrors.EmailAlreadyExistsError:
        case RegisterUserErrors.UsernameTakenError:
          throw new ConflictException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@UserEntity() user: User): Promise<LoginResponseDto> {
    const result = await this.loginUsecase.execute(user);

    if (result.isLeft()) {
      const error = result.value;
      throw new InternalServerErrorException(error.errorValue().message);
    }

    return result.value.getValue();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getCurrentUser(@UserEntity() user: User): Promise<UserDto> {
    return UserMapper.toDto(user);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(
    @UserEntity() user: User,
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshAccessTokenResponseDto> {
    const result = await this.refreshAccessTokenUsecase.execute(user);

    if (result.isRight()) {
      const accessToken: AccessToken = result.value.getValue();
      return {
        accessToken: accessToken,
        refreshToken: refreshTokenDto.refreshToken,
      };
    }

    if (result.isLeft()) {
      const error = result.value;
      throw new InternalServerErrorException(error.errorValue().message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@UserEntity() user: User): Promise<void> {
    const result = await this.logoutUsecase.execute(user);
    if (result.isLeft()) {
      const error = result.value;
      throw new InternalServerErrorException(error.errorValue().message);
    }
  }
}
