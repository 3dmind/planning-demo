import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { ApiConfigService } from '../../../api-config/api-config.service';
import { AccessToken, RefreshToken } from '../domain/jwt';
import { JwtClaims } from '../domain/jwt-claims.interface';
import { User } from '../domain/user.entity';

type Tokens = {
  accessToken: AccessToken;
  refreshToken: RefreshToken;
};

@Injectable()
export class AuthService {
  private readonly accessTokenSecret: string;
  private readonly accessTokenTtl: number;

  private readonly refreshTokenSecret: string;
  private readonly refreshTokenTtl: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManger: Cache,
    private readonly apiConfigService: ApiConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.accessTokenSecret = this.apiConfigService.getAccessTokenSecret();
    this.accessTokenTtl = this.apiConfigService.getAccessTokenTtl();

    this.refreshTokenSecret = this.apiConfigService.getRefreshTokenSecret();
    this.refreshTokenTtl = this.apiConfigService.getRefreshTokenTtl();
  }

  public createAccessToken(payload: JwtClaims): AccessToken {
    return this.jwtService.sign(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenTtl,
    });
  }

  public createRefreshToken(payload: JwtClaims): RefreshToken {
    return this.jwtService.sign(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenTtl,
    });
  }

  public async saveAuthenticatedUser(user: User): Promise<void> {
    if (user.isLoggedIn()) {
      const value = JSON.stringify({
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      });
      await this.cacheManger.set(user.username.value, value, {
        ttl: this.refreshTokenTtl,
      });
    }
  }

  public async deAuthenticateUser(user: User): Promise<void> {
    await this.cacheManger.del(user.username.value);
  }

  public async getTokens(username: string): Promise<Tokens> {
    const value = await this.cacheManger.get<string>(username);
    if (!!value) {
      return JSON.parse(value);
    } else {
      return null;
    }
  }

  public async validateAccessToken(
    username: string,
    accessToken: AccessToken,
  ): Promise<boolean> {
    const savedTokens = await this.cacheManger.get<string>(username);
    if (!!savedTokens === false) {
      return false;
    }

    const parsedTokens: Tokens = JSON.parse(savedTokens);
    return parsedTokens.accessToken === accessToken;
  }

  public async validateRefreshToken(
    username: string,
    refreshToken: RefreshToken,
  ): Promise<boolean> {
    const savedTokens = await this.cacheManger.get<string>(username);
    if (!!savedTokens === false) {
      return false;
    }

    const parsedTokens: Tokens = JSON.parse(savedTokens);
    return parsedTokens.refreshToken === refreshToken;
  }
}
