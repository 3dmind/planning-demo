import { JwtToken } from '../../domain/jwt';

export class RefreshTokenDto {
  refreshToken: JwtToken;
}
