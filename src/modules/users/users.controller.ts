import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Post,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Username } from '../../decorators/username.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { AppErrors } from '../../shared/core';
import { UserEntity } from './domain/user.entity';
import { CreateUserDto } from './use-cases/create-user/create-user.dto';
import { CreateUserErrors } from './use-cases/create-user/create-user.errors';
import { CreateUserUseCase } from './use-cases/create-user/create-user.use-case';
import { GetUserByUserNameError } from './use-cases/get-user-by-user-name/get-user-by-user-name.errors';
import { GetUserByUserNameUseCase } from './use-cases/get-user-by-user-name/get-user-by-user-name.usecase';
import { LoginResponseDto } from './use-cases/login/login-response.dto';
import { LoginUseCase } from './use-cases/login/login.usecase';
import { User } from './user.decorator';
import { UserDto } from './user.dto';
import { UserMapper } from './user.mapper';

@Controller('users')
export class UsersController {
  constructor(
    private readonly logger: Logger,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getUserByUserNameUseCase: GetUserByUserNameUseCase,
  ) {
    this.logger.setContext('UsersController');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createTaskDto: CreateUserDto): Promise<void> {
    const result = await this.createUserUseCase.execute(createTaskDto);

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
    const result = await this.loginUseCase.execute(validatedUser);

    if (result.isLeft()) {
      const error = result.value;
      throw new InternalServerErrorException(error.errorValue().message);
    }

    return result.value.getValue();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getCurrentUser(@Username() username: string): Promise<UserDto> {
    const result = await this.getUserByUserNameUseCase.execute({ username });

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
}
