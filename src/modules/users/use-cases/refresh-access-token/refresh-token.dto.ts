import { JwtToken } from '../../domain/jwt';

export class RefreshTokenDto {
  refresh_token: JwtToken;
}
