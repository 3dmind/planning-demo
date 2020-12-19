import { AccessToken, RefreshToken } from './jwt';
import { UserEmailValueObject } from './user-email.value-object';
import { UserNameValueObject } from './user-name.value-object';
import { UserPasswordValueObject } from './user-password.value-object';

export interface UserPropsInterface {
  accessToken?: AccessToken;
  createdAt?: Date;
  email: UserEmailValueObject;
  isEmailVerified?: boolean;
  password: UserPasswordValueObject;
  refreshToken?: RefreshToken;
  username: UserNameValueObject;
}
