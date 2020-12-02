import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { CreateUserUseCase } from './use-cases/create-user/create-user.use-case';
import { GetUserByUserNameUseCase } from './use-cases/get-user-by-user-name/get-user-by-user-name.usecase';
import { LoginUseCase } from './use-cases/login/login.usecase';
import { UsersController } from './users.controller';

describe('Users Controller', () => {
  const mockedLogger = mock<Logger>();
  const mockedCreateUserUseCase = mock<CreateUserUseCase>();
  const mockedLoginUseCase = mock<LoginUseCase>();
  const mockedGetUserByUserNameUseCase = mock<GetUserByUserNameUseCase>();
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: Logger,
          useValue: mockedLogger,
        },
        {
          provide: CreateUserUseCase,
          useValue: mockedCreateUserUseCase,
        },
        {
          provide: LoginUseCase,
          useValue: mockedLoginUseCase,
        },
        {
          provide: GetUserByUserNameUseCase,
          useValue: mockedGetUserByUserNameUseCase,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
