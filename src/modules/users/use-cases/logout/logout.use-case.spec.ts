import { CACHE_MANAGER, CacheModule } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { UserEntityBuilder } from '../../../../../test/builder/user-entity.builder';
import { ApiConfigService } from '../../../../api-config/api-config.service';
import { AppErrors } from '../../../../shared/core';
import { UserName } from '../../domain/user-name.valueobject';
import { UserRepository } from '../../domain/user.repository';
import { InMemoryUserRepository } from '../../repositories/user/implementations/in-memory-user.repository';
import { AuthService } from '../../services/auth.service';
import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  const mockedApiConfigService = mock<ApiConfigService>();
  const accessTokenSecretFixture = 'defaultaccesstokensecret';
  const accessTokenTtlFixture = 10; // seconds
  const refreshTokenSecretFixture = 'defaultrefreshtokensecret';
  const refreshTokenTtlFixture = 10; // seconds

  let cacheManager: Cache;
  let authService: AuthService;
  let userRepository: UserRepository;
  let useCase: LogoutUseCase;

  beforeAll(async () => {
    mockedApiConfigService.getAccessTokenSecret.mockReturnValue(accessTokenSecretFixture);
    mockedApiConfigService.getAccessTokenTtl.mockReturnValue(accessTokenTtlFixture);

    mockedApiConfigService.getRefreshTokenSecret.mockReturnValue(refreshTokenSecretFixture);
    mockedApiConfigService.getRefreshTokenTtl.mockReturnValue(refreshTokenTtlFixture);

    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ store: 'memory' })],
      providers: [
        { provide: 'JWT_MODULE_OPTIONS', useValue: {} },
        { provide: ApiConfigService, useValue: mockedApiConfigService },
        { provide: UserRepository, useClass: InMemoryUserRepository },
        JwtService,
        AuthService,
        LogoutUseCase,
      ],
    }).compile();
    module.useLogger(false);

    authService = module.get<AuthService>(AuthService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    userRepository = module.get<UserRepository>(UserRepository);
    useCase = module.get<LogoutUseCase>(LogoutUseCase);
  });

  afterAll(() => {
    mockReset(mockedApiConfigService);
  });

  it('should fail on any other error', async () => {
    // Given
    const user = new UserEntityBuilder().makeLoggedIn().build();
    const spy = jest.spyOn(authService, 'deAuthenticateUser').mockImplementationOnce(() => {
      throw new Error();
    });

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
    const userNameFixture = faker.internet.userName();
    const userName = UserName.create(userNameFixture).getValue();
    const user = new UserEntityBuilder().withUserName(userName).makeLoggedIn().build();
    await userRepository.save(user);
    await authService.saveAuthenticatedUser(user);

    // When
    const valueBeforeLogout = await cacheManager.get(userNameFixture);
    const result = await useCase.execute(user);
    const valueAfterLockout = await cacheManager.get(userNameFixture);

    // Then
    expect.assertions(3);
    expect(valueBeforeLogout).toBeDefined();
    expect(result.isRight()).toBe(true);
    expect(valueAfterLockout).toBeUndefined();
  });
});
