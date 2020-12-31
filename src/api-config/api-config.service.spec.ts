import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { ApiConfigService } from './api-config.service';

describe.only('ApiConfigService', () => {
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
    expect.assertions(1);

    const isDevelopment = service.isDevelopment();

    expect(isDevelopment).toBe(true);
  });

  it('should provide log levels', () => {
    expect.assertions(5);

    const logLevel = service.getLogLevel();

    expect(logLevel).toContainEqual('debug');
    expect(logLevel).toContainEqual('error');
    expect(logLevel).toContainEqual('log');
    expect(logLevel).toContainEqual('verbose');
    expect(logLevel).toContainEqual('warn');
  });

  it('should provide the redis host', () => {
    expect.assertions(1);
    const hostnameFixture = 'foo';
    process.env.REDIS_HOST = hostnameFixture;

    const redisHost = service.getRedisHost();

    expect(redisHost).toEqual(hostnameFixture);
  });

  it('should provide the default redis port number', () => {
    expect.assertions(1);
    const defaultRedisPort = 6379;
    process.env.REDIS_PORT = '';

    const redisPort = service.getRedisPort();

    expect(redisPort).toEqual(defaultRedisPort);
  });

  it('should provide the redis port number', () => {
    expect.assertions(1);
    const redisPortFixture = '7000';
    const parsedPortFixture = Number.parseInt(redisPortFixture, 10);
    process.env.REDIS_PORT = redisPortFixture;

    const redisPort = service.getRedisPort();

    expect(redisPort).toEqual(parsedPortFixture);
  });

  it('should provide the access token secret', () => {
    expect.assertions(1);
    const tokenSecretFixture = faker.random.alphaNumeric(10);
    process.env.JWT_ACCESS_TOKEN_SECRET = tokenSecretFixture;

    const accessTokenSecret = service.getAccessTokenSecret();

    expect(accessTokenSecret).toEqual(tokenSecretFixture);
  });

  it('should provide the default access token TTL', () => {
    expect.assertions(1);
    const defaultTtl = 300; // seconds => 5 minutes
    process.env.JWT_ACCESS_TOKEN_TTL = '';

    const accessTokenTtl = service.getAccessTokenTtl();

    expect(accessTokenTtl).toEqual(defaultTtl);
  });

  it('should provide the access token TTL', () => {
    expect.assertions(1);
    const ttlFixture = faker.random.number(300);
    process.env.JWT_ACCESS_TOKEN_TTL = ttlFixture.toString();

    const accessTokenTtl = service.getAccessTokenTtl();

    expect(accessTokenTtl).toEqual(ttlFixture);
  });

  it('should provide the refresh token secret', () => {
    expect.assertions(1);
    const tokenSecretFixture = faker.random.alphaNumeric(10);
    process.env.JWT_REFRESH_TOKEN_SECRET = tokenSecretFixture;

    const refreshTokenSecret = service.getRefreshTokenSecret();

    expect(refreshTokenSecret).toEqual(tokenSecretFixture);
  });

  it('should provide the default refresh token TTL', () => {
    expect.assertions(1);
    const defaultTtl = 604800; // seconds => 7 days
    process.env.JWT_REFRESH_TOKEN_TTL = '';

    const refreshTokenTtl = service.getRefreshTokenTtl();

    expect(refreshTokenTtl).toEqual(defaultTtl);
  });

  it('should provide the refresh token TTL', () => {
    expect.assertions(1);
    const ttlFixture = faker.random.number(604800);
    process.env.JWT_REFRESH_TOKEN_TTL = ttlFixture.toString();

    const refreshTokenTtl = service.getRefreshTokenTtl();

    expect(refreshTokenTtl).toEqual(ttlFixture);
  });
});
