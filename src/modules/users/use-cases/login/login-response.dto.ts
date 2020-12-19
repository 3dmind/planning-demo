import { AccessToken, RefreshToken } from '../../domain/jwt';

export class LoginResponseDto {
  access_token: AccessToken;
  refresh_token: RefreshToken;
}
