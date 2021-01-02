import { CacheModule } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { UserEntityBuilder } from '../../../../test/builder/user-entity.builder';
import { ApiConfigService } from '../../../api-config/api-config.service';
import { RedisCacheService } from '../../../redis-cache/redis-cache.service';
import { JwtClaims } from '../domain/jwt-claims.interface';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const mockedApiConfigService = mock<ApiConfigService>();
  const accessTokenSecretFixture = 'defaultaccesstokensecret';
  const accessTokenTtlFixture = 10; // seconds
  const refreshTokenSecretFixture = 'defaultrefreshtokensecret';
  const refreshTokenTtlFixture = 10; // seconds

  let jwtService: JwtService;
  let redisCacheService: RedisCacheService;
  let service: AuthService;

  beforeAll(async () => {
    mockedApiConfigService.getAccessTokenSecret.mockReturnValueOnce(
      accessTokenSecretFixture,
    );
    mockedApiConfigService.getAccessTokenTtl.mockReturnValueOnce(
      accessTokenTtlFixture,
    );

    mockedApiConfigService.getRefreshTokenSecret.mockReturnValueOnce(
      refreshTokenSecretFixture,
    );
    mockedApiConfigService.getRefreshTokenTtl.mockReturnValueOnce(
      refreshTokenTtlFixture,
    );

    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ store: 'memory' })],
      providers: [
        { provide: JWT_MODULE_OPTIONS, useValue: {} },
        { provide: ApiConfigService, useValue: mockedApiConfigService },
        RedisCacheService,
        JwtService,
        AuthService,
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    redisCacheService = module.get<RedisCacheService>(RedisCacheService);
    service = module.get<AuthService>(AuthService);
  });

  afterAll(() => {
    mockReset(mockedApiConfigService);
  });

  it('should create access token', () => {
    expect.assertions(1);
    const usernameFixture = faker.internet.userName();
    const payloadFixture: JwtClaims = {
      username: usernameFixture,
    };

    const accessToken = service.createAccessToken(payloadFixture);

    expect(jwtService.decode(accessToken)).toMatchObject<JwtClaims>({
      username: usernameFixture,
    });
  });

  it('should create refresh token', () => {
    expect.assertions(1);
    const usernameFixture = faker.internet.userName();
    const payloadFixture: JwtClaims = {
      username: usernameFixture,
    };

    const refreshToken = service.createRefreshToken(payloadFixture);

    expect(jwtService.decode(refreshToken)).toMatchObject<JwtClaims>({
      username: usernameFixture,
    });
  });

  it('should save authenticated user', async () => {
    expect.assertions(1);
    const user = new UserEntityBuilder().build();
    const userSnapshot = user.createSnapshot();
    const accessToken = service.createAccessToken({
      username: userSnapshot.username.value,
    });
    const refreshToken = service.createRefreshToken({
      username: userSnapshot.username.value,
    });
    user.setTokens(accessToken, refreshToken);

    await service.saveAuthenticatedUser(user);
    const result = await redisCacheService.get(userSnapshot.username.value);

    expect(result).toBeDefined();
  });

  it('should remove authenticated user', async () => {
    expect.assertions(2);
    const username = 'tomtest';
    const user = new UserEntityBuilder({ username }).makeLoggedIn().build();
    let value;

    await service.saveAuthenticatedUser(user);
    value = await redisCacheService.get(username);

    expect(value).toBeDefined();

    await service.deAuthenticateUser(user);
    value = await redisCacheService.get(username);

    expect(value).toBeUndefined();
  });

  it('should access saved tokens', async () => {
    expect.assertions(1);
    const username = faker.internet.userName();
    const user = new UserEntityBuilder({ username }).build();
    await service.saveAuthenticatedUser(user);

    const tokens = await service.getTokens(username);

    expect(tokens).toBeDefined();
  });

  it('should validate access token', async () => {
    expect.assertions(2);
    const username = faker.internet.userName();
    const validAccessToken = faker.random.alphaNumeric(10);
    const invalidAccessToken = faker.random.alphaNumeric(10);
    const user = new UserEntityBuilder({
      username,
    })
      .makeLoggedIn({ accessToken: validAccessToken })
      .build();
    let result: boolean;
    await service.saveAuthenticatedUser(user);

    result = await service.validateAccessToken(username, validAccessToken);

    expect(result).toBe(true);

    result = await service.validateAccessToken(username, invalidAccessToken);

    expect(result).toBe(false);
  });

  it('should validate refresh token', async () => {
    expect.assertions(2);
    const username = faker.internet.userName();
    const validRefreshToken = faker.random.alphaNumeric(10);
    const invalidRefreshToken = faker.random.alphaNumeric(10);
    const user = new UserEntityBuilder({
      username,
    })
      .makeLoggedIn({ refreshToken: validRefreshToken })
      .build();
    let result: boolean;
    await service.saveAuthenticatedUser(user);

    result = await service.validateRefreshToken(username, validRefreshToken);

    expect(result).toBe(true);

    result = await service.validateRefreshToken(username, invalidRefreshToken);

    expect(result).toBe(false);
  });
});
