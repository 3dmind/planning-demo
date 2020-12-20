import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiConfigService } from '../../api-config/api-config.service';
import { RedisCacheService } from '../../redis-cache/redis-cache.service';
import { AccessToken, RefreshToken } from './domain/jwt';
import { JwtClaimsInterface } from './domain/jwt-claims.interface';
import { UserEntity } from './domain/user.entity';

@Injectable()
export class AuthService {
  private readonly accessTokenSecret: string;
  private readonly accessTokenTtl: number;

  private readonly refreshTokenSecret: string;
  private readonly refreshTokenTtl: number;

  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly jwtService: JwtService,
    private readonly redisCacheService: RedisCacheService,
  ) {
    this.accessTokenSecret = this.apiConfigService.getAccessTokenSecret();
    this.accessTokenTtl = this.apiConfigService.getAccessTokenTtl();

    this.refreshTokenSecret = this.apiConfigService.getRefreshTokenSecret();
    this.refreshTokenTtl = this.apiConfigService.getRefreshTokenTtl();
  }

  public createAccessToken(payload: JwtClaimsInterface): AccessToken {
    return this.jwtService.sign(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenTtl,
    });
  }

  public createRefreshToken(payload: JwtClaimsInterface): RefreshToken {
    return this.jwtService.sign(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenTtl,
    });
  }

  public async saveAuthenticatedUser(user: UserEntity): Promise<void> {
    if (user.isLoggedIn()) {
      const userSnapshot = user.createSnapshot();
      const tokens = JSON.stringify({
        accessToken: userSnapshot.accessToken,
        refreshToken: userSnapshot.refreshToken,
      });
      await this.redisCacheService.set(userSnapshot.username.value, tokens, {
        ttl: this.refreshTokenTtl,
      });
    }
  }
}
