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
import { UserName } from '../domain/user-name.valueobject';
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
    // Given
    const usernameFixture = faker.internet.userName();
    const payloadFixture: JwtClaims = {
      username: usernameFixture,
    };

    // When
    const accessToken = service.createAccessToken(payloadFixture);

    // Then
    expect.assertions(1);
    expect(jwtService.decode(accessToken)).toMatchObject<JwtClaims>({
      username: usernameFixture,
    });
  });

  it('should create refresh token', () => {
    // Given
    const usernameFixture = faker.internet.userName();
    const payloadFixture: JwtClaims = {
      username: usernameFixture,
    };

    // When
    const refreshToken = service.createRefreshToken(payloadFixture);

    // Then
    expect.assertions(1);
    expect(jwtService.decode(refreshToken)).toMatchObject<JwtClaims>({
      username: usernameFixture,
    });
  });

  it('should save authenticated user', async () => {
    // Given
    const user = new UserEntityBuilder().build();
    const accessToken = service.createAccessToken({
      username: user.username.value,
    });
    const refreshToken = service.createRefreshToken({
      username: user.username.value,
    });
    user.setTokens(accessToken, refreshToken);

    // When
    await service.saveAuthenticatedUser(user);
    const result = await redisCacheService.get(user.username.value);

    // Then
    expect.assertions(1);
    expect(result).toBeDefined();
  });

  it('should remove authenticated user', async () => {
    // Given
    const userNameFixture = 'tomtest';
    const userName = UserName.create(userNameFixture).getValue();
    const user = new UserEntityBuilder()
      .withUserName(userName)
      .makeLoggedIn()
      .build();

    // When
    await service.saveAuthenticatedUser(user);
    const valueBefore = await redisCacheService.get(userNameFixture);
    await service.deAuthenticateUser(user);
    const valueAfter = await redisCacheService.get(userNameFixture);

    // Then
    expect.assertions(2);
    expect(valueBefore).toBeDefined();
    expect(valueAfter).toBeUndefined();
  });

  it('should access saved tokens', async () => {
    // Given
    const userNameFixture = faker.internet.userName();
    const userName = UserName.create(userNameFixture).getValue();
    const accessToken = faker.random.alphaNumeric(10);
    const refreshToken = faker.random.alphaNumeric(10);
    const user = new UserEntityBuilder()
      .withUserName(userName)
      .makeLoggedIn({
        accessToken,
        refreshToken,
      })
      .build();
    await service.saveAuthenticatedUser(user);

    // When
    const tokens = await service.getTokens(userNameFixture);

    // Then
    expect.assertions(2);
    expect(tokens).not.toBeNull();
    expect(tokens).toMatchObject({
      accessToken: expect.stringMatching(accessToken),
      refreshToken: expect.stringMatching(refreshToken),
    });
  });

  it('should validate access token', async () => {
    // Given
    const userNameFixture = faker.internet.userName();
    const userName = UserName.create(userNameFixture).getValue();
    const validAccessToken = faker.random.alphaNumeric(10);
    const invalidAccessToken = faker.random.alphaNumeric(10);
    const user = new UserEntityBuilder()
      .withUserName(userName)
      .makeLoggedIn({ accessToken: validAccessToken })
      .build();
    await service.saveAuthenticatedUser(user);

    // When
    const validResult = await service.validateAccessToken(
      userNameFixture,
      validAccessToken,
    );
    const invalidResult = await service.validateAccessToken(
      userNameFixture,
      invalidAccessToken,
    );

    // Then
    expect.assertions(2);
    expect(validResult).toBe(true);
    expect(invalidResult).toBe(false);
  });

  it('should validate refresh token', async () => {
    // Given
    const userNameFixture = faker.internet.userName();
    const userName = UserName.create(userNameFixture).getValue();
    const validRefreshToken = faker.random.alphaNumeric(10);
    const invalidRefreshToken = faker.random.alphaNumeric(10);
    const user = new UserEntityBuilder()
      .withUserName(userName)
      .makeLoggedIn({ refreshToken: validRefreshToken })
      .build();
    await service.saveAuthenticatedUser(user);

    // When
    const validResult = await service.validateRefreshToken(
      userNameFixture,
      validRefreshToken,
    );
    const invalidResult = await service.validateRefreshToken(
      userNameFixture,
      invalidRefreshToken,
    );

    // Then
    expect.assertions(2);
    expect(validResult).toBe(true);
    expect(invalidResult).toBe(false);
  });
});
