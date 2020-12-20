import { CacheModule, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';
import { UserEntityBuilder } from '../../../../../test/builder/user-entity.builder';
import { ApiConfigService } from '../../../../api-config/api-config.service';
import { RedisCacheService } from '../../../../redis-cache/redis-cache.service';
import { AppErrors } from '../../../../shared/core';
import { AuthService } from '../../auth.service';
import { LoginResponseDto } from './login-response.dto';
import { LoginUseCase } from './login.usecase';

describe('LoginUseCase', () => {
  const mockedLogger = mock<Logger>();
  const mockedConfigService = mock<ApiConfigService>();

  const accessTokenSecretFixture = 'defaultaccesstokensecret';
  const accessTokenTtlFixture = 10; // seconds
  const refreshTokenSecretFixture = 'defaultrefreshtokensecret';
  const refreshTokenTtlFixture = 10; // seconds

  let redisCacheService: RedisCacheService;
  let authService: AuthService;
  let useCase: LoginUseCase;

  beforeAll(async () => {
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
        { provide: JWT_MODULE_OPTIONS, useValue: {} },
        { provide: Logger, useValue: mockedLogger },
        { provide: ApiConfigService, useValue: mockedConfigService },
        RedisCacheService,
        JwtService,
        AuthService,
        LoginUseCase,
      ],
    }).compile();

    redisCacheService = await module.resolve<RedisCacheService>(
      RedisCacheService,
    );
    authService = await module.resolve<AuthService>(AuthService);
    useCase = await module.resolve<LoginUseCase>(LoginUseCase);
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedConfigService);
  });

  it('should fail on any error', async () => {
    expect.assertions(2);
    const spy = jest
      .spyOn(authService, 'createAccessToken')
      .mockImplementationOnce(() => {
        throw new Error('BOOM!');
      });
    const user = new UserEntityBuilder().build();

    const result = await useCase.execute(user);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    expect.assertions(3);
    const user = new UserEntityBuilder().build();
    const userSnapshot = user.createSnapshot();

    const result = await useCase.execute(user);

    expect(result.isRight()).toBe(true);
    expect(result.value.getValue()).toMatchObject<LoginResponseDto>({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });

    const value = await redisCacheService.get(userSnapshot.username.value);

    expect(value).toBeDefined();
  });
});
