import { AccessToken, RefreshToken } from '../../domain/jwt';

export class LoginResponseDto {
  accessToken: AccessToken;
  refreshToken: RefreshToken;
}
