import { CacheModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { any, mock, mockReset } from 'jest-mock-extended';
import { UserEntityBuilder } from '../../../test/builder/user-entity.builder';
import { RedisCacheService } from '../../redis-cache/redis-cache.service';
import { AuthService } from './auth.service';
import { JwtClaimsInterface } from './domain/jwt-claims.interface';

describe('AuthService', () => {
  const mockedConfigService = mock<ConfigService>();
  const accessTokenSecretFixture = 'defaultaccesstokensecret';
  const accessTokenTtlFixture = 10; // seconds
  const refreshTokenSecretFixture = 'defaultrefreshtokensecret';
  const refreshTokenTtlFixture = 10; // seconds

  let jwtService: JwtService;
  let redisCacheService: RedisCacheService;
  let authService: AuthService;

  beforeAll(async () => {
    mockedConfigService.get
      .calledWith('JWT_ACCESS_TOKEN_SECRET', any())
      .mockReturnValueOnce(accessTokenSecretFixture);
    mockedConfigService.get
      .calledWith('JWT_ACCESS_TOKEN_TTL', any())
      .mockReturnValueOnce(accessTokenTtlFixture);

    mockedConfigService.get
      .calledWith('JWT_REFRESH_TOKEN_SECRET', any())
      .mockReturnValueOnce(refreshTokenSecretFixture);
    mockedConfigService.get
      .calledWith('JWT_REFRESH_TOKEN_TTL', any())
      .mockReturnValueOnce(refreshTokenTtlFixture);

    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ store: 'memory' })],
      providers: [
        { provide: JWT_MODULE_OPTIONS, useValue: {} },
        { provide: ConfigService, useValue: mockedConfigService },
        RedisCacheService,
        JwtService,
        AuthService,
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    redisCacheService = module.get<RedisCacheService>(RedisCacheService);
    authService = module.get<AuthService>(AuthService);
  });

  afterAll(() => {
    mockReset(mockedConfigService);
  });

  it('should create access token', () => {
    expect.assertions(1);
    const usernameFixture = faker.internet.userName();
    const payloadFixture: JwtClaimsInterface = {
      username: usernameFixture,
    };

    const accessToken = authService.createAccessToken(payloadFixture);

    expect(jwtService.decode(accessToken)).toMatchObject<JwtClaimsInterface>({
      username: usernameFixture,
    });
  });

  it('should create refresh token', () => {
    expect.assertions(1);
    const usernameFixture = faker.internet.userName();
    const payloadFixture: JwtClaimsInterface = {
      username: usernameFixture,
    };

    const refreshToken = authService.createRefreshToken(payloadFixture);

    expect(jwtService.decode(refreshToken)).toMatchObject<JwtClaimsInterface>({
      username: usernameFixture,
    });
  });

  it('should save authenticated user', async () => {
    expect.assertions(1);
    const user = new UserEntityBuilder().build();
    const userSnapshot = user.createSnapshot();
    const accessToken = authService.createAccessToken({
      username: userSnapshot.username.value,
    });
    const refreshToken = authService.createRefreshToken({
      username: userSnapshot.username.value,
    });
    user.setTokens(accessToken, refreshToken);

    await authService.saveAuthenticatedUser(user);
    const result = await redisCacheService.get(userSnapshot.username.value);

    expect(result).toBeDefined();
  });
});
