import { JwtToken } from '../../domain/jwt';

export class RefreshAccessTokenResponseDto {
  access_token: JwtToken;
  refresh_token: JwtToken;
}
