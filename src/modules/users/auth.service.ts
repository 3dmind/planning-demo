import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtToken } from './domain/jwt';
import { JwtClaimsInterface } from './domain/jwt-claims.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  public createAccessToken(payload: JwtClaimsInterface): JwtToken {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: '60s',
    });
  }

  public createRefreshToken(payload: JwtClaimsInterface): JwtToken {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: '30d',
    });
  }
}
