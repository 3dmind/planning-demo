import { CacheModule } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { UserEntityBuilder } from '../../../../../test/builder/user-entity.builder';
import { ApiConfigService } from '../../../../api-config/api-config.service';
import { RedisCacheService } from '../../../../redis-cache/redis-cache.service';
import { AppErrors } from '../../../../shared/core';
import { InMemoryUserRepository } from '../../repositories/user/in-memory-user.repository';
import { UserRepository } from '../../repositories/user/user.repository';
import { AuthService } from '../../services/auth.service';
import { RefreshAccessTokenRequestDto } from './refresh-access-token-request.dto';
import { RefreshAccessTokenErrors } from './refresh-access-token.errors';
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

  beforeEach(async () => {
    mockedConfigService.getAccessTokenSecret.mockReturnValue(
      accessTokenSecretFixture,
    );
    mockedConfigService.getAccessTokenTtl.mockReturnValue(
      accessTokenTtlFixture,
    );

    mockedConfigService.getRefreshTokenSecret.mockReturnValue(
      refreshTokenSecretFixture,
    );
    mockedConfigService.getRefreshTokenTtl.mockReturnValue(
      refreshTokenTtlFixture,
    );

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
        RedisCacheService,
        JwtService,
        AuthService,
        RefreshAccessTokenUsecase,
      ],
    }).compile();
    module.useLogger(false);

    authService = await module.resolve<AuthService>(AuthService);
    userRepository = await module.resolve<UserRepository>(UserRepository);
    useCase = await module.resolve<RefreshAccessTokenUsecase>(
      RefreshAccessTokenUsecase,
    );
  });

  afterAll(() => {
    mockReset(mockedConfigService);
  });

  it('should be defined', () => {
    expect.assertions(1);
    expect(useCase).toBeDefined();
  });

  it('should fail if username cannot be created', async () => {
    expect.assertions(1);
    const request: RefreshAccessTokenRequestDto = {
      username: '',
    };

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
  });

  it('should fail if user cannot be found', async () => {
    expect.assertions(3);
    const usernameFixture = faker.internet.userName();
    const request: RefreshAccessTokenRequestDto = {
      username: usernameFixture,
    };

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      RefreshAccessTokenErrors.UserNotFoundError,
    );
    expect(result.value.errorValue().message).toEqual(
      `User with the username '${usernameFixture}' does not exist.`,
    );
  });

  it('should fail on any other error', async () => {
    expect.assertions(2);
    const usernameFixture = faker.internet.userName();
    const request: RefreshAccessTokenRequestDto = {
      username: usernameFixture,
    };
    const spy = jest.spyOn(userRepository, 'getUserByUsername');
    spy.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    expect.assertions(1);
    const usernameFixture = faker.internet.userName();
    const user = new UserEntityBuilder({
      username: usernameFixture,
    })
      .makeLoggedIn()
      .build();
    await authService.saveAuthenticatedUser(user);
    await userRepository.save(user);

    const request: RefreshAccessTokenRequestDto = {
      username: usernameFixture,
    };

    const result = await useCase.execute(request);

    expect(result.isRight()).toBe(true);
  });
});
