import { AccessToken, RefreshToken } from './jwt';
import { UserEmail } from './user-email.valueobject';
import { UserName } from './user-name.valueobject';
import { UserPassword } from './user-password.valueobject';

export interface UserProps {
  accessToken?: AccessToken;
  createdAt?: Date;
  email: UserEmail;
  isEmailVerified?: boolean;
  password: UserPassword;
  refreshToken?: RefreshToken;
  username: UserName;
}
