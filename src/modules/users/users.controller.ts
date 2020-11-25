import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { AppErrors } from '../../shared/core';
import { UserEntity } from './domain/user.entity';
import { CreateUserDto } from './use-cases/create-user/create-user.dto';
import { CreateUserErrors } from './use-cases/create-user/create-user.errors';
import { CreateUserUseCase } from './use-cases/create-user/create-user.use-case';
import { User } from './user.decorator';
import { UserDto } from './user.dto';
import { UserMapper } from './user.mapper';

@Controller('users')
export class UsersController {
  constructor(
    private readonly logger: Logger,
    private readonly createUserUseCase: CreateUserUseCase,
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
  async login(@User() user: UserEntity): Promise<UserDto> {
    return UserMapper.toDto(user);
  }
}
