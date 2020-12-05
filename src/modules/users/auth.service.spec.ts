import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { any, mock } from 'jest-mock-extended';
import { AuthService } from './auth.service';
import { JwtClaimsInterface } from './domain/jwt-claims.interface';

describe('AuthService', () => {
  const mockedConfigService = mock<ConfigService>();

  let jwtService: JwtService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: JWT_MODULE_OPTIONS, useValue: {} },
        { provide: ConfigService, useValue: mockedConfigService },
        JwtService,
        AuthService,
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should create access token', () => {
    expect.assertions(1);
    const usernameFixture = faker.internet.userName();
    const payloadFixture: JwtClaimsInterface = {
      username: usernameFixture,
    };
    const secretFixture = 'defaultaccesstokensecret';
    mockedConfigService.get
      .calledWith('JWT_ACCESS_TOKEN_SECRET', any())
      .mockReturnValueOnce(secretFixture);

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
    const secretFixture = 'defaultrefreshtokensecret';
    mockedConfigService.get
      .calledWith('JWT_REFRESH_TOKEN_SECRET', any())
      .mockReturnValueOnce(secretFixture);

    const refreshToken = authService.createRefreshToken(payloadFixture);

    expect(jwtService.decode(refreshToken)).toMatchObject<JwtClaimsInterface>({
      username: usernameFixture,
    });
  });
});
