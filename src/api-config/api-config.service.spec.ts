import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { ApiConfigService } from './api-config.service';

describe('ApiConfigService', () => {
  const OLD_ENV = Object.assign({}, process.env);
  let service: ApiConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: false,
          ignoreEnvFile: true,
        }),
      ],
      providers: [ApiConfigService],
    }).compile();

    service = module.get<ApiConfigService>(ApiConfigService);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should determine development mode', () => {
    // When
    const isDevelopment = service.isDevelopment();

    // Then
    expect.assertions(1);
    expect(isDevelopment).toBe(true);
  });

  it('should provide log levels', () => {
    // When
    const logLevel = service.getLogLevel();

    // Then
    expect.assertions(5);
    expect(logLevel).toContainEqual('debug');
    expect(logLevel).toContainEqual('error');
    expect(logLevel).toContainEqual('log');
    expect(logLevel).toContainEqual('verbose');
    expect(logLevel).toContainEqual('warn');
  });

  it('should provide the redis host', () => {
    // Given
    const hostnameFixture = 'foo';
    process.env.REDIS_HOST = hostnameFixture;

    // When
    const redisHost = service.getRedisHost();

    // Then
    expect.assertions(1);
    expect(redisHost).toEqual(hostnameFixture);
  });

  it('should provide the default redis port number', () => {
    // Given
    const defaultRedisPort = 6379;
    process.env.REDIS_PORT = '';

    // When
    const redisPort = service.getRedisPort();

    // Then
    expect.assertions(1);
    expect(redisPort).toEqual(defaultRedisPort);
  });

  it('should provide the redis port number', () => {
    // Given
    const redisPortFixture = '7000';
    const parsedPortFixture = Number.parseInt(redisPortFixture, 10);
    process.env.REDIS_PORT = redisPortFixture;

    // When
    const redisPort = service.getRedisPort();

    // Then
    expect.assertions(1);
    expect(redisPort).toEqual(parsedPortFixture);
  });

  it('should provide the access token secret', () => {
    // Given
    const tokenSecretFixture = faker.random.alphaNumeric(10);
    process.env.JWT_ACCESS_TOKEN_SECRET = tokenSecretFixture;

    // When
    const accessTokenSecret = service.getAccessTokenSecret();

    // Then
    expect.assertions(1);
    expect(accessTokenSecret).toEqual(tokenSecretFixture);
  });

  it('should provide the default access token TTL', () => {
    // Given
    const defaultTtl = 300; // seconds => 5 minutes
    process.env.JWT_ACCESS_TOKEN_TTL = '';

    // When
    const accessTokenTtl = service.getAccessTokenTtl();

    // Then
    expect.assertions(1);
    expect(accessTokenTtl).toEqual(defaultTtl);
  });

  it('should provide the access token TTL', () => {
    // Given
    const ttlFixture = faker.random.number(300);
    process.env.JWT_ACCESS_TOKEN_TTL = ttlFixture.toString();

    // When
    const accessTokenTtl = service.getAccessTokenTtl();

    // Then
    expect.assertions(1);
    expect(accessTokenTtl).toEqual(ttlFixture);
  });

  it('should provide the refresh token secret', () => {
    // Given
    const tokenSecretFixture = faker.random.alphaNumeric(10);
    process.env.JWT_REFRESH_TOKEN_SECRET = tokenSecretFixture;

    // When
    const refreshTokenSecret = service.getRefreshTokenSecret();

    // Then
    expect.assertions(1);
    expect(refreshTokenSecret).toEqual(tokenSecretFixture);
  });

  it('should provide the default refresh token TTL', () => {
    // Given
    const defaultTtl = 604800; // seconds => 7 days
    process.env.JWT_REFRESH_TOKEN_TTL = '';

    // When
    const refreshTokenTtl = service.getRefreshTokenTtl();

    // Then
    expect.assertions(1);
    expect(refreshTokenTtl).toEqual(defaultTtl);
  });

  it('should provide the refresh token TTL', () => {
    // Given
    const ttlFixture = faker.random.number(604800);
    process.env.JWT_REFRESH_TOKEN_TTL = ttlFixture.toString();

    // When
    const refreshTokenTtl = service.getRefreshTokenTtl();

    // Then
    expect.assertions(1);
    expect(refreshTokenTtl).toEqual(ttlFixture);
  });
});
