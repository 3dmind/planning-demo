import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ApiConfigService } from '../../../api-config/api-config.service';
import { JwtClaimsInterface } from '../domain/jwt-claims.interface';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'JwtRefreshToken',
) {
  constructor(private readonly apiConfigService: ApiConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: apiConfigService.getRefreshTokenSecret(),
    });
  }

  async validate(
    decodedToken: JwtClaimsInterface,
  ): Promise<JwtClaimsInterface> {
    return decodedToken;
  }
}
