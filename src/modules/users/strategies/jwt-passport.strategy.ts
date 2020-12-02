import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtClaimsInterface } from '../domain/jwt-claims.interface';

@Injectable()
export class JwtPassportStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('APP_SECRET'),
    });
  }

  async validate(
    decodedToken: JwtClaimsInterface,
  ): Promise<JwtClaimsInterface> {
    return decodedToken;
  }
}
