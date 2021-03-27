import { JwtToken } from '../../domain/jwt';

export class RefreshAccessTokenResponseDto {
  accessToken: JwtToken;
  refreshToken: JwtToken;
}
