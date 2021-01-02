import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';
import { GetUserByUserNameUsecase } from '../use-cases/get-user-by-user-name/get-user-by-user-name.usecase';
import { LoginUsecase } from '../use-cases/login/login.usecase';
import { LogoutUsecase } from '../use-cases/logout/logout.usecase';
import { RefreshAccessTokenUsecase } from '../use-cases/refresh-access-token/refresh-access-token.usecase';
import { RegisterUserUsecase } from '../use-cases/register-user/register-user.usecase';
import { UsersController } from './users.controller';

describe('Users Controller', () => {
  const mockedCreateUserUseCase = mock<RegisterUserUsecase>();
  const mockedGetUserByUserNameUseCase = mock<GetUserByUserNameUsecase>();
  const mockedLoginUseCase = mock<LoginUsecase>();
  const mockedLogoutUseCase = mock<LogoutUsecase>();
  const mockedRefreshAccessTokenUseCase = mock<RefreshAccessTokenUsecase>();
  let controller: UsersController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: RegisterUserUsecase,
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

  afterAll(() => {
    mockReset(mockedCreateUserUseCase);
    mockReset(mockedGetUserByUserNameUseCase);
    mockReset(mockedLoginUseCase);
    mockReset(mockedLogoutUseCase);
    mockReset(mockedRefreshAccessTokenUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
