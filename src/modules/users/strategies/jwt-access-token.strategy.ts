import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ApiConfigService } from '../../../api-config/api-config.service';
import { JwtClaimsInterface } from '../domain/jwt-claims.interface';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'JwtAccessToken',
) {
  constructor(private readonly apiConfigService: ApiConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: apiConfigService.getAccessTokenSecret(),
    });
  }

  async validate(
    decodedToken: JwtClaimsInterface,
  ): Promise<JwtClaimsInterface> {
    return decodedToken;
  }
}
