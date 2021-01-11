import { CacheModule } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
import { LogoutUsecase } from './logout.usecase';

describe('LogoutUsecase', () => {
  const mockedApiConfigService = mock<ApiConfigService>();
  const accessTokenSecretFixture = 'defaultaccesstokensecret';
  const accessTokenTtlFixture = 10; // seconds
  const refreshTokenSecretFixture = 'defaultrefreshtokensecret';
  const refreshTokenTtlFixture = 10; // seconds

  let redisCacheService: RedisCacheService;
  let authService: AuthService;
  let userRepository: UserRepository;
  let useCase: LogoutUsecase;

  beforeEach(async () => {
    mockedApiConfigService.getAccessTokenSecret.mockReturnValue(
      accessTokenSecretFixture,
    );
    mockedApiConfigService.getAccessTokenTtl.mockReturnValue(
      accessTokenTtlFixture,
    );

    mockedApiConfigService.getRefreshTokenSecret.mockReturnValue(
      refreshTokenSecretFixture,
    );
    mockedApiConfigService.getRefreshTokenTtl.mockReturnValue(
      refreshTokenTtlFixture,
    );

    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ store: 'memory' })],
      providers: [
        { provide: 'JWT_MODULE_OPTIONS', useValue: {} },
        { provide: ApiConfigService, useValue: mockedApiConfigService },
        { provide: UserRepository, useClass: InMemoryUserRepository },
        RedisCacheService,
        JwtService,
        AuthService,
        LogoutUsecase,
      ],
    }).compile();
    module.useLogger(false);

    authService = await module.resolve<AuthService>(AuthService);
    redisCacheService = await module.resolve<RedisCacheService>(
      RedisCacheService,
    );
    userRepository = await module.resolve<UserRepository>(UserRepository);
    useCase = await module.resolve<LogoutUsecase>(LogoutUsecase);
  });

  afterAll(() => {
    mockReset(mockedApiConfigService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should fail on any other error', async () => {
    expect.assertions(2);
    const user = new UserEntityBuilder().makeLoggedIn().build();
    const spy = jest.spyOn(authService, 'deAuthenticateUser');
    spy.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await useCase.execute(user);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    expect.assertions(3);
    const username = faker.internet.userName();
    const user = new UserEntityBuilder({ username }).makeLoggedIn().build();
    await userRepository.save(user);
    await authService.saveAuthenticatedUser(user);

    let value = await redisCacheService.get(username);
    expect(value).toBeDefined();

    const result = await useCase.execute(user);
    expect(result.isRight()).toBe(true);

    value = await redisCacheService.get(username);
    expect(value).toBeUndefined();
  });
});
