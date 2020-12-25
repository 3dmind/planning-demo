import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ApiConfigService } from '../../../api-config/api-config.service';
import { AuthService } from '../auth.service';
import { AccessToken } from '../domain/jwt';
import { JwtClaimsInterface } from '../domain/jwt-claims.interface';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'JwtAccessToken',
) {
  public static extractor = ExtractJwt.fromAuthHeaderAsBearerToken();

  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: JwtAccessTokenStrategy.extractor,
      ignoreExpiration: false,
      secretOrKey: apiConfigService.getAccessTokenSecret(),
      passReqToCallback: true,
    });
  }

  public async validate(
    request: Request,
    decodedToken: JwtClaimsInterface,
  ): Promise<JwtClaimsInterface> {
    const accessToken: AccessToken = JwtAccessTokenStrategy.extractor(request);
    const { username } = decodedToken;
    const isValidToken = await this.authService.validateAccessToken(
      username,
      accessToken,
    );

    if (isValidToken) {
      return decodedToken;
    } else {
      throw new ForbiddenException(
        'Authorization token not found.',
        'User is probably not logged in. Please log in again.',
      );
    }
  }
}
