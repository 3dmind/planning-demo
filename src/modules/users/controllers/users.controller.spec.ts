import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { CreateUserUsecase } from '../use-cases/create-user/create-user.usecase';
import { GetUserByUserNameUsecase } from '../use-cases/get-user-by-user-name/get-user-by-user-name.usecase';
import { LoginUsecase } from '../use-cases/login/login.usecase';
import { LogoutUsecase } from '../use-cases/logout/logout.usecase';
import { RefreshAccessTokenUsecase } from '../use-cases/refresh-access-token/refresh-access-token.usecase';
import { UsersController } from './users.controller';

describe('Users Controller', () => {
  const mockedLogger = mock<Logger>();
  const mockedCreateUserUseCase = mock<CreateUserUsecase>();
  const mockedLoginUseCase = mock<LoginUsecase>();
  const mockedGetUserByUserNameUseCase = mock<GetUserByUserNameUsecase>();
  const mockedRefreshAccessTokenUseCase = mock<RefreshAccessTokenUsecase>();
  const mockedLogoutUseCase = mock<LogoutUsecase>();
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
          provide: CreateUserUsecase,
          useValue: mockedCreateUserUseCase,
        },
        {
          provide: LoginUsecase,
          useValue: mockedLoginUseCase,
        },
        {
          provide: GetUserByUserNameUsecase,
          useValue: mockedGetUserByUserNameUseCase,
        },
        {
          provide: RefreshAccessTokenUsecase,
          useValue: mockedRefreshAccessTokenUseCase,
        },
        {
          provide: LogoutUsecase,
          useValue: mockedLogoutUseCase,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
