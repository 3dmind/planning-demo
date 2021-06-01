import { CacheModule } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';
import { UserEntityBuilder } from '../../../../../test/builder/user-entity.builder';
import { ApiConfigService } from '../../../../api-config/api-config.service';
import { AppErrors } from '../../../../shared/core';
import { UserRepository } from '../../domain/user.repository';
import { InMemoryUserRepository } from '../../repositories/user/implementations/in-memory-user.repository';
import { AuthService } from '../../services/auth.service';
import { RefreshAccessTokenUsecase } from './refresh-access-token.usecase';

describe('RefreshAccessTokenUsecase', () => {
  const mockedConfigService = mock<ApiConfigService>();
  const accessTokenSecretFixture = 'defaultaccesstokensecret';
  const accessTokenTtlFixture = 10; // seconds
  const refreshTokenSecretFixture = 'defaultrefreshtokensecret';
  const refreshTokenTtlFixture = 10; // seconds
  let authService: AuthService;
  let userRepository: UserRepository;
  let useCase: RefreshAccessTokenUsecase;

  beforeAll(async () => {
    mockedConfigService.getAccessTokenSecret.mockReturnValue(accessTokenSecretFixture);
    mockedConfigService.getAccessTokenTtl.mockReturnValue(accessTokenTtlFixture);

    mockedConfigService.getRefreshTokenSecret.mockReturnValue(refreshTokenSecretFixture);
    mockedConfigService.getRefreshTokenTtl.mockReturnValue(refreshTokenTtlFixture);

    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ store: 'memory' })],

      providers: [
        {
          provide: JWT_MODULE_OPTIONS,
          useValue: {},
        },
        {
          provide: ApiConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
        JwtService,
        AuthService,
        RefreshAccessTokenUsecase,
      ],
    }).compile();
    module.useLogger(false);

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    useCase = module.get<RefreshAccessTokenUsecase>(RefreshAccessTokenUsecase);
  });

  afterAll(() => {
    mockReset(mockedConfigService);
  });

  it('should fail on any other error', async () => {
    // Given
    const spy = jest.spyOn(authService, 'createAccessToken').mockImplementationOnce(() => {
      throw new Error();
    });
    const user = new UserEntityBuilder().build();

    // When
    const result = await useCase.execute(user);

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const user = new UserEntityBuilder().makeLoggedIn().build();
    await authService.saveAuthenticatedUser(user);
    await userRepository.save(user);

    // When
    const result = await useCase.execute(user);

    // Then
    expect.assertions(1);
    expect(result.isRight()).toBe(true);
  });
});
