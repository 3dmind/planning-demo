import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ApiConfigService } from '../../../api-config/api-config.service';
import { RefreshToken } from '../domain/jwt';
import { JwtClaimsInterface } from '../domain/jwt-claims.interface';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'JwtRefreshToken',
) {
  public static extractor = ExtractJwt.fromBodyField('refresh_token');

  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: JwtRefreshTokenStrategy.extractor,
      ignoreExpiration: false,
      secretOrKey: apiConfigService.getRefreshTokenSecret(),
      passReqToCallback: true,
    });
  }

  public async validate(
    request: Request,
    decodedToken: JwtClaimsInterface,
  ): Promise<JwtClaimsInterface> {
    const refreshToken: RefreshToken = JwtRefreshTokenStrategy.extractor(
      request,
    );
    const { username } = decodedToken;
    const isValidToken = await this.authService.validateRefreshToken(
      username,
      refreshToken,
    );

    if (isValidToken) {
      return decodedToken;
    } else {
      throw new ForbiddenException(
        'Refresh token not found.',
        'User is probably not logged in. Please log in again.',
      );
    }
  }
}
